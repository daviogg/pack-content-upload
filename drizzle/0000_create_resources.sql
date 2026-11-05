CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"language" text NOT NULL,
	"provider" text NOT NULL,
	"roles" text[] NOT NULL,
	"file_key" text NOT NULL,
	"file_original_name" text NOT NULL,
	"file_mime_type" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"uploaded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "resources_uploaded_at_idx" ON "resources" USING btree ("uploaded_at");