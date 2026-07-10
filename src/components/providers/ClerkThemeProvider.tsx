"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useWebsiteTheme } from "@/components/providers/WebsiteThemeProvider";

export default function ClerkThemeProvider({
                                               children,
                                               publishableKey,
                                           }: {
    children: React.ReactNode;
    publishableKey: string | undefined;
}) {
    const { resolvedColorMode } = useWebsiteTheme();

    return (
        <ClerkProvider
            publishableKey={publishableKey}
            appearance={{
                baseTheme: resolvedColorMode === "dark" ? dark : undefined,

                variables: {
                    colorPrimary: "hsl(221.2 83.2% 53.3%)",
                },

                elements: {
                    card: "glass-panel border-border shadow-xl",
                    navbar: "bg-transparent",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",

                    socialButtonsBlockButton:
                        "glass-button border-border hover:bg-muted/40",

                    formButtonPrimary:
                        "bg-primary text-primary-foreground hover:bg-primary/90",

                    formFieldLabel: "text-foreground",

                    formFieldInput:
                        "glass-input border-border",

                    footerActionText:
                        "text-muted-foreground",

                    footerActionLink:
                        "text-primary hover:text-primary/90",

                    userButtonPopoverCard:
                        "glass-panel border-border shadow-xl",

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