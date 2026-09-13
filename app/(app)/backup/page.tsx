"use client"

import { PageHeader } from "@/components/page-header"
import { BackupRestorePanel } from "@/components/backup-restore"

export default function BackupPage() {
  return (
    <>
      <PageHeader title="Backup" description="Keep your data safe locally and in Google Drive." />
      <div className="mx-auto w-full max-w-3xl">
        <BackupRestorePanel />
      </div>
    </>
  )
}
