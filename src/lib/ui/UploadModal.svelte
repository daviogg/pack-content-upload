<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { UploadFormOptions, UploadFormValues } from './uploadForm';

	interface Props {
		options: UploadFormOptions;
		/** Echoed values and error from a failed submit, if any. */
		values?: UploadFormValues;
		error?: { field?: string; message: string };
	}

	let { options, values, error }: Props = $props();

	// The only client-side state: the name of the file picked, shown next to "Select file".
	let fileName = $state('');

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
		<a href={resolve('/')} aria-label="Close" class="absolute top-5 right-6 text-2xl text-muted"
			>&times;</a
		>
		<h2 id="upload-title" class="mb-6 text-2xl font-semibold sm:mb-8 sm:text-3xl">
			Upload Resource
		</h2>

		<form
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			use:enhance
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

			<fieldset
				class="rounded-lg border border-line px-4 py-3 {error?.field === 'roles' ? errorClass : ''}"
			>
				<legend class="px-1 text-sm text-muted">Role*</legend>
				<div class="flex gap-8">
					{#each options.roles as role (role.code)}
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								name="roles"
								value={role.code}
								defaultChecked={values?.roles.includes(role.code) ?? false}
								class="rounded border-line text-brand focus:ring-brand"
							/>
							{role.label}
						</label>
					{/each}
				</div>
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
					class="rounded-lg bg-brand px-7 py-2.5 text-xl font-bold text-white hover:bg-brand-dark"
				>
					Upload
				</button>
			</div>
		</form>
	</div>
</div>
