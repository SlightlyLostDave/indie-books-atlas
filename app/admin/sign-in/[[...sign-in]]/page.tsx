import { SignIn } from "@clerk/nextjs";

export default function AdminSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#7c9a55",
            colorBackground: "#19150f",
            colorForeground: "#ece4d6",
            colorMuted: "#a99f8e",
            colorInput: "#100e0b",
            colorInputForeground: "#ece4d6",
            borderRadius: "0.5rem",
          },
        }}
      />
    </div>
  );
}
