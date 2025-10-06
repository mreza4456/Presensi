import { getAccountData } from "@/action/account"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import { AccountForm } from "@/components/form/account-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"

export default async function AccountPage() {


  // Get account data
  const accountResult = await getAccountData()

  if (!accountResult.success || !accountResult.data) {
    return (
      <ContentLayout title="Account Settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {accountResult.message || "Failed to load account data. Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout title="Account Settings">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information, work details, and security settings.
          </p>
        </div>
        
        <AccountForm initialData={accountResult.data} />
      </div>
    </ContentLayout>
  )
}
