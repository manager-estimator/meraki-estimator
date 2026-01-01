import AuthLayout from "../components/AuthLayout";
import EmailVerification from "../components/EmailVerification";

export const dynamic = "force-dynamic";


type SearchParams = Record<string, string | string[] | undefined>;

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp: SearchParams = searchParams ?? {};
const rawEmail = sp.email;
  const email = Array.isArray(rawEmail) ? (rawEmail[0] ?? "") : (rawEmail ?? "");
  const rawResent = sp.resent;
  const resent = (Array.isArray(rawResent) ? rawResent[0] : rawResent) === "1";
  return (
    <AuthLayout>
      <EmailVerification email={email} initialSent={resent} />
    </AuthLayout>
  );
}
