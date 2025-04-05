"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import OtpModal from "@/components/OTPModal";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import { handleDemoClick } from "@/lib/actions/user.actions"

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
    return z.object({
        email: z.string().email(),
        fullName:
            formType === "sign-up"
                ? z.string().min(2).max(50)
                : z.string().optional(),
    });
}
const AuthForm = ({ type }: { type: FormType }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [accountId, setAccountId] = useState(null);

    const formSchema = authFormSchema(type);


    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
        },
    })

    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsLoading(true);
        setErrorMessage("");
        try {
            const user =
                type === "sign-up"
                    ? await createAccount({
                        fullName: values.fullName || "",
                        email: values.email,
                    })
                    : await signInUser({ email: values.email });

            setAccountId(user.accountId);
        } catch (error: any) {
            // Check for specific error scenarios
            if (error.message === "User already exists") {
                setErrorMessage("User already exists.");
            } else if (error.message === "User does not exist") {
                setErrorMessage("User does not exist. Please sign up.");
            } else {
                setErrorMessage("Failed to create account or sign in. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Form {...form}>
                <div className="space-y-8 auth-form">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <h1 className="form-title">
                            {type === "sign-in" ? "Sign In" : "Sign Up"}
                        </h1>
                        {type === "sign-up" && (<FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="shad-form-item">
                                        <FormLabel className="shad-form-label">Full Name</FormLabel>

                                        <FormControl>
                                            <Input
                                                placeholder="Enter your full name"
                                                className="shad-input"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>

                                    <FormMessage className="shad-form-message" />
                                </FormItem>
                            )}
                        />)}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="shad-form-item">
                                        <FormLabel className="shad-form-label">Email</FormLabel>

                                        <FormControl>
                                            <Input
                                                placeholder="Enter your email"
                                                className="shad-input"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>

                                    <FormMessage className="shad-form-message" />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="form-submit-button mt-8"
                            disabled={isLoading}
                        >
                            {type === "sign-in" ? "Sign In" : "Sign Up"}

                            {isLoading && (
                                <Image
                                    src="/assets/icons/loader.svg"
                                    alt="loader"
                                    width={24}
                                    height={24}
                                    className="ml-2 animate-spin"
                                />
                            )}
                        </Button>
                    </form>
                    <Button
                        type="submit"
                        className="form-submit-button"
                        onClick={
                            async () => {
                                setIsDemoLoading(true);
                                try {
                                    await handleDemoClick();
                                } catch (error: any) {
                                    // setErrorMessage("Please try again in some time.");
                                } finally {
                                    setIsDemoLoading(false);
                                }
                            }
                        }
                    >
                        Demo VaultPro
                        {isDemoLoading && (
                            <Image
                                src="/assets/icons/loader.svg"
                                alt="loader"
                                width={24}
                                height={24}
                                className="ml-2 animate-spin"
                            />
                        )}
                    </Button>
                    {errorMessage && <p className="error-message">*{errorMessage}</p>}
                    <div className="body-2 flex justify-center">
                        <p className="text-light-100">
                            {type === "sign-in"
                                ? "Don't have an account?"
                                : "Already have an account?"}
                        </p>
                        <Link
                            href={type === "sign-in" ? "/sign-up" : "/sign-in"}
                            className="ml-1 font-medium text-brand"
                        >
                            {" "}
                            {type === "sign-in" ? "Sign Up" : "Sign In"}
                        </Link>
                    </div>
                </div>
            </Form>
            {accountId && (
                <OtpModal email={form.getValues("email")} accountId={accountId} />
            )}
        </>
    )
}

export default AuthForm;