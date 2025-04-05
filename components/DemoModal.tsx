"use client";

import { useState } from "react";
import Image from "next/image";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DemoModal = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent className="shad-alert-dialog">
                    <AlertDialogHeader className="relative flex justify-center">
                        <AlertDialogTitle className="h2 text-center">
                            Welcome to VaultPro!
                            <Image
                                src="/assets/icons/close-dark.svg"
                                alt="close"
                                width={20}
                                height={20}
                                onClick={() => setIsOpen(false)}
                                className="otp-close-button"
                            />
                        </AlertDialogTitle>
                        <AlertDialogDescription className="subtitle-2  text-light-100">
                            <br />
                            As a demo user, you've been restricted to explore VaultPro's certain features and functionalities only.
                            <br /><br />
                            You're maximum vault capacity is 2GB.
                            <br /><br />
                            You won't be able to share your vault contents with other users.
                            <br /><br />
                            <span className="h4 font-bold">Create an account to unlock all our features!</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default DemoModal;