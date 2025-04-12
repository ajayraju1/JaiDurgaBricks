"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/utils/i18n";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { signIn, signInWithMagicLink, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"password" | "magic">("password");
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Handle redirect when user is logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Email is required");
    if (authMode === "password" && !password)
      return setError("Password is required");

    try {
      if (authMode === "password") {
        await signIn(email, password);
      } else {
        await signInWithMagicLink(email);
        setMagicLinkSent(true);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please try again.";
      setError(errorMessage);
    }
  };

  // Don't render anything if we're redirecting to home
  if (user && !isLoading) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <BuildingStorefrontIcon className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="mt-2 text-3xl font-bold text-indigo-700">
            {t("brand.name")}
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-700">
            {t("auth.signIn") || "Sign in to your account"}
          </h2>
        </div>

        <Card>
          <CardContent className="p-6">
            {magicLinkSent ? (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("auth.checkEmail") || "Check your email"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("auth.magicLinkSent") ||
                    "We've sent a magic link to your email. Click on it to sign in."}
                </p>
                <Button
                  onClick={() => {
                    setMagicLinkSent(false);
                    setEmail("");
                  }}
                  className="w-full"
                >
                  {t("auth.backToLogin") || "Back to Login"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-6">
                {error && (
                  <div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("auth.email") || "Email address"}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="your@email.com"
                  />
                </div>

                {authMode === "password" && (
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("auth.password") || "Password"}
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? t("auth.signingIn") || "Signing in..."
                      : authMode === "password"
                      ? t("auth.signIn") || "Sign in"
                      : t("auth.sendMagicLink") || "Send Magic Link"}
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setAuthMode(
                        authMode === "password" ? "magic" : "password"
                      )
                    }
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    {authMode === "password"
                      ? t("auth.useMagicLink") ||
                        "Sign in with Magic Link instead"
                      : t("auth.usePassword") ||
                        "Sign in with Password instead"}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
