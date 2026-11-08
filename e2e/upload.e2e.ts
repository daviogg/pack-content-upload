import { expect, test } from '@playwright/test';

/** Walks the whole slice: form → use case → Postgres + disk → table → detail → file. */
test('uploads a resource, lists it and serves its file', async ({ page }) => {
	const title = `E2E guide ${Date.now()}`;

	await page.goto('/');
	await page.getByRole('link', { name: 'Upload' }).click();

	const form = page.getByRole('dialog');
	await form.getByPlaceholder('Title*').fill(title);
	await form.getByPlaceholder('Description*').fill('Uploaded by the end-to-end test');
	await form.locator('select[name="category"]').selectOption('leadership');
	await form.locator('select[name="language"]').selectOption('en');
	await form.locator('select[name="provider"]').selectOption('pack');
	await form.getByText('Role*').click();
	await form.getByLabel('Mentor / Coach').check();
	await form.locator('input[name="file"]').setInputFiles({
		name: 'guide.pdf',
		mimeType: 'application/pdf',
		buffer: Buffer.from('%PDF-1.4 e2e')
	});
	await form.getByRole('button', { name: 'Upload' }).click();

	await expect(page.getByRole('status')).toContainText('Resource Uploaded Successfully!');
	const row = page.getByRole('row', { name: title });
	await expect(row).toBeVisible();
	await expect(row).toContainText('Leadership');
	await expect(row).toContainText('PDF');

	// The dialog's history entry was replaced: Back lands on the plain list
	await page.goBack();
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await page.goForward();

	await row.getByRole('link', { name: title }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);

	const openUrl = await page.getByRole('link', { name: 'Open' }).getAttribute('href');
	expect(openUrl).toMatch(/^\/files\//);
	const file = await page.request.get(openUrl!);
	expect(file.status()).toBe(200);
	expect(file.headers()['content-type']).toBe('application/pdf');
	expect(file.headers()['content-disposition']).toContain('inline');
	expect(await file.text()).toBe('%PDF-1.4 e2e');
});

test('shows the domain error and keeps the typed values when no role is selected', async ({
	page
}) => {
	await page.goto('/?upload=1');

	const form = page.getByRole('dialog');
	await form.getByPlaceholder('Title*').fill('Missing roles');
	await form.getByPlaceholder('Description*').fill('Should be rejected');
	await form.locator('select[name="category"]').selectOption('communication');
	await form.locator('select[name="language"]').selectOption('it');
	await form.locator('select[name="provider"]').selectOption('skilla');
	await form.locator('input[name="file"]').setInputFiles({
		name: 'notes.txt',
		mimeType: 'text/plain',
		buffer: Buffer.from('hello')
	});
	await form.getByRole('button', { name: 'Upload' }).click();

	await expect(form.getByRole('alert')).toHaveText('Select at least one role');
	await expect(form.getByPlaceholder('Title*')).toHaveValue('Missing roles');
	await expect(form.locator('select[name="language"]')).toHaveValue('it');
});
