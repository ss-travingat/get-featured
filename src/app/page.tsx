import EmailVerificationForm from "@/components/ui/EmailVerificationForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-sans p-4 sm:p-8">
      <div className="w-full max-w-md">
        <EmailVerificationForm />
      </div>
    </div>
  );
}
