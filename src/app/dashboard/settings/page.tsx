"use client";

import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
        <h2 className="font-semibold text-text-primary mb-4">
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Name
            </label>
            <p className="text-sm text-text-primary">
              {session?.user?.name || "Not set"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <p className="text-sm text-text-primary">
              {session?.user?.email || "Not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
