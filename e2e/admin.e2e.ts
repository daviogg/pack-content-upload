import { expect, test, type Page } from '@playwright/test';

/** Matches ADMIN_PASSWORD in playwright.config.ts. */
const PASSWORD = 'e2e-admin';

async function uploadResource(page: Page, title: string): Promise<string> {
	await page.goto('/?upload=1');
	const form = page.getByRole('dialog');
	await form.getByPlaceholder('Title*').fill(title);
	await form.getByPlaceholder('Description*').fill('Created by the admin end-to-end test');
	await form.locator('select[name="category"]').selectOption('personal-growth');
	await form.locator('select[name="language"]').selectOption('en');
	await form.locator('select[name="provider"]').selectOption('mentor');
	await form.getByText('Role*').click();
	await form.getByLabel('Mentee / Coachee').check();
	await form.locator('input[name="file"]').setInputFiles({
		name: 'notes.txt',
		mimeType: 'text/plain',
		buffer: Buffer.from('to be deleted')
	});
	await form.getByRole('button', { name: 'Upload' }).click();
	await expect(page.getByRole('status')).toContainText('Resource Uploaded Successfully!');

	const href = await page
		.getByRole('row', { name: title })
		.getByRole('link', { name: title })
		.getAttribute('href');
	return href!;
}

test('anonymous users see no Delete button and cannot call the action', async ({ page }) => {
	const detailUrl = await uploadResource(page, `Protected ${Date.now()}`);

	await page.goto(detailUrl);
	await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);

	const response = await page.request.post(`${detailUrl}?/delete`, { form: {} });
	expect(response.status()).toBe(403);
	await page.goto(detailUrl);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('an administrator logs in, deletes a resource and logs out', async ({ page }) => {
	const title = `Disposable ${Date.now()}`;
	const detailUrl = await uploadResource(page, title);

	await page.getByRole('link', { name: 'Admin' }).click();
	await expect(page).toHaveURL(/\/admin$/);
	await page.getByPlaceholder('Password').fill('wrong');
	await page.getByRole('button', { name: 'Log in' }).click();
	await expect(page.getByRole('alert')).toHaveText('Wrong password');

	await page.getByPlaceholder('Password').fill(PASSWORD);
	await page.getByRole('button', { name: 'Log in' }).click();
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

	await page.goto(detailUrl);
	page.once('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: 'Delete' }).click();

	await expect(page).toHaveURL('/?deleted=1');
	await expect(page.getByRole('status')).toContainText('Resource deleted.');
	await expect(page.getByRole('row', { name: title })).toHaveCount(0);
	expect((await page.request.get(detailUrl)).status()).toBe(404);

	await page.getByRole('button', { name: 'Log out' }).click();
	await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
});
