import AccountClient from "./AccountClient";
import { getCurrentUserEmail } from "../../lib/currentUserEmail";
export default async function AccountPage() {
  const email = await getCurrentUserEmail();
  return <AccountClient email={email} />;
}

