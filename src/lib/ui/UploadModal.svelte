<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { UploadFormOptions, UploadFormValues } from './uploadForm';

	interface Props {
		options: UploadFormOptions;
		/** Echoed values and error from a failed submit, if any. */
		values?: UploadFormValues;
		error?: { field?: string; message: string };
	}

	let { options, values, error }: Props = $props();

	// Client-side state: the file picked (shown next to "Select file") and
	// whether a submit is in flight, so a second click cannot start a second upload.
	let fileName = $state('');
	let submitting = $state(false);
	const fieldClass =
		'w-full rounded-lg border-line text-base placeholder:text-muted/60 focus:border-brand focus:ring-brand';
	const errorClass = 'border-red-500';

	function cls(field: string): string {
		return `${fieldClass} ${error?.field === field ? errorClass : ''}`;
	}
</script>

<div
	class="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-6 sm:pt-24"
>
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="upload-title"
		class="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl sm:p-10"
	>
		<!-- Closing replaces the dialog's history entry for the same reason -->
		<a
			href={resolve('/')}
			data-sveltekit-replacestate
			aria-label="Close"
			class="absolute top-5 right-6 text-2xl text-muted">&times;</a
		>
		<h2 id="upload-title" class="mb-6 text-2xl font-semibold sm:mb-8 sm:text-3xl">
			Upload Resource
		</h2>

		<form
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					if (result.type === 'redirect') {
						// Replace the dialog's history entry: Back from the list must not reopen it.
						// The location is our own server's redirect, not user input.
						// eslint-disable-next-line svelte/no-navigation-without-resolve
						await goto(result.location, { replaceState: true, invalidateAll: true });
					} else {
						await update();
					}
					submitting = false;
				};
			}}
			class="space-y-5"
		>
			<div>
				<input
					name="title"
					placeholder="Title*"
					required
					maxlength={options.titleMaxLength}
					defaultValue={values?.title ?? ''}
					class={cls('title')}
				/>
			</div>

			<div>
				<input
					name="description"
					placeholder="Description*"
					required
					maxlength={options.descriptionMaxLength}
					defaultValue={values?.description ?? ''}
					class={cls('description')}
				/>
			</div>

			<select name="category" required class={cls('category')}>
				<option value="" disabled selected={!values?.category}>Category*</option>
				{#each options.categories as c (c.code)}
					<option value={c.code} selected={values?.category === c.code}>{c.label}</option>
				{/each}
			</select>

			<select name="language" required class={cls('language')}>
				<option value="" disabled selected={!values?.language}>Language*</option>
				{#each options.languages as l (l.code)}
					<option value={l.code} selected={values?.language === l.code}>{l.label}</option>
				{/each}
			</select>

			<select name="provider" required class={cls('provider')}>
				<option value="" disabled selected={!values?.provider}>Provider*</option>
				{#each options.providers as p (p.code)}
					<option value={p.code} selected={values?.provider === p.code}>{p.label}</option>
				{/each}
			</select>

			<!--
				Roles are multi-select (brief). Checkboxes under the hood, shown as toggle pills
				inside a field-shaped box so the row reads like the other inputs. No JavaScript:
				`peer-checked` styles the pill from the hidden checkbox's state.
			-->
			<fieldset
				class="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2 {error?.field ===
				'roles'
					? errorClass
					: 'border-line'}"
			>
				<legend class="sr-only">Role*</legend>
				<span class="mr-auto text-muted/60">Role*</span>
				{#each options.roles as role (role.code)}
					<label class="cursor-pointer">
						<input
							type="checkbox"
							name="roles"
							value={role.code}
							defaultChecked={values?.roles.includes(role.code) ?? false}
							class="peer sr-only"
						/>
						<span
							class="inline-block rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-muted peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand/50 hover:border-brand"
						>
							{role.label}
						</span>
					</label>
				{/each}
			</fieldset>

			<div class="flex items-center gap-4">
				<div
					class="flex-1 rounded-lg border px-4 py-2.5 text-base {error?.field === 'file'
						? errorClass
						: 'border-line'} {fileName ? '' : 'text-muted/60'}"
				>
					{fileName || 'No file selected*'}
				</div>
				<label
					class="cursor-pointer rounded-lg border border-line px-6 py-2.5 text-lg font-bold hover:bg-surface"
				>
					Select file
					<input
						type="file"
						name="file"
						required
						accept={options.accept}
						class="sr-only"
						onchange={(e) => (fileName = e.currentTarget.files?.[0]?.name ?? '')}
					/>
				</label>
			</div>

			{#if error}
				<p class="text-sm text-red-600" role="alert">{error.message}</p>
			{/if}

			<div class="flex justify-end pt-2">
				<button
					type="submit"
					disabled={submitting}
					class="rounded-lg bg-brand px-7 py-2.5 text-xl font-bold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
				>
					{submitting ? 'Uploading…' : 'Upload'}
				</button>
			</div>
		</form>
	</div>
</div>
