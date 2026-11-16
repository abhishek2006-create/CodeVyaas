"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function ClerkThemeProvider({
                                               children,
                                               publishableKey,
                                           }: {
    children: React.ReactNode;
    publishableKey: string | undefined;
}) {

    return (
        <ClerkProvider
            publishableKey={publishableKey}
            appearance={{
                baseTheme: dark,

                variables: {
                    colorPrimary: "#f887ff",
                },

                elements: {
                    card: "surface-panel border-border shadow-xl",
                    navbar: "bg-transparent",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",

                    socialButtonsBlockButton:
                        "surface-button border-border hover:bg-muted",

                    formButtonPrimary:
                        "bg-primary text-primary-foreground hover:bg-primary/90",

                    formFieldLabel: "text-foreground",

                    formFieldInput:
                        "surface-input border-border",

                    footerActionText:
                        "text-muted-foreground",

                    footerActionLink:
                        "text-primary hover:text-primary/90",

                    userButtonPopoverCard:
                        "surface-panel border-border shadow-xl",

                    userButtonPopoverActionButtonText:
                        "text-foreground",

                    userButtonPopoverFooter:
                        "hidden",
                },
            }}
        >
            {children}
        </ClerkProvider>
    );
}