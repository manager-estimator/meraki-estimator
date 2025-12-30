import AuthLayout from "./components/AuthLayout";
import AuthTabsForm from "./components/AuthTabsForm";

export default function HomePage() {
  return (
    <AuthLayout>
      <AuthTabsForm defaultMode="signup" />
    </AuthLayout>
  );
}
