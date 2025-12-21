import AuthLayout from "../components/AuthLayout";
import EmailVerification from "../components/EmailVerification";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; resent?: string }>;
}) {
  const sp = await (searchParams ?? Promise.resolve({}));
  const email = sp?.email ?? "";
  const resent = sp?.resent === "1";

  return (
    <AuthLayout>
      <EmailVerification email={email} initialSent={resent} />
    </AuthLayout>
  );
}
