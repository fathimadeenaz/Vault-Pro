"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Query, ID } from "node-appwrite";

import { getAvatarPlaceholderUrl } from "@/constants";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { parseStringify } from "@/lib/utils";


const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])],
    );

    return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);

        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send an OTP");
    }
};

export const createAccount = async ({
    fullName,
    email,
}: {
    fullName: string;
    email: string;
}) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Failed to send an OTP");

    if (existingUser) {
        throw new Error("User already exists");
    }

    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: getAvatarPlaceholderUrl(fullName),
                accountId,
            },
        );
    }

    return parseStringify({ accountId });
};

export const verifySecret = async ({
    accountId,
    password,
}: {
    accountId: string;
    password: string;
}) => {
    try {
        const { account } = await createAdminClient();

        const session = await account.createSession(accountId, password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify({ sessionId: session.$id });
    } catch (error) {
        handleError(error, "Failed to verify OTP");
    }
};

export const getCurrentUser = async () => {
    try {
        const { databases, account } = await createSessionClient();

        const result = await account.get();

        const user = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            [Query.equal("email", result.email)],
        );

        if (user.total <= 0) return null;

        return parseStringify(user.documents[0]);
    } catch (error) {
        console.log(error);
    }
};

export const isDemoUser = async () => {
    const currentUser = await getCurrentUser();
    return currentUser.email === "demo@demo.com" ? true : false
}

export const signOutUser = async () => {
    const { account } = await createSessionClient();

    try {
        await account.deleteSession("current");
        (await cookies()).delete("appwrite-session");
    } catch (error) {
        handleError(error, "Failed to sign out user");
    } finally {
        redirect("/sign-in");
    }
};

export const signInUser = async ({ email }: { email: string }) => {
    try {
        const existingUser = await getUserByEmail(email);

        if (!existingUser) {
            throw new Error("User does not exist");
        }

        if (existingUser) {
            await sendEmailOTP({ email });
            return parseStringify({ accountId: existingUser.accountId });
        }

        return parseStringify({ accountId: null, error: "User does not exist" });
    } catch (error) {
        handleError(error, "User does not exist");
    }
};

export const handleDemoClick = async () => {
    const email = "demo@demo.com";
    const password = "demo@123";
    const fullName = "Demo User";
    const accountId = ID.unique();

    const { account, databases } = await createAdminClient();

    try {
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            const session = await account.createEmailPasswordSession(email, password);

            (await cookies()).set("appwrite-session", session.secret, {
                path: "/",
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            });

            redirect("/");
        }

        const session = await account.create(ID.unique(), email, password);

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: getAvatarPlaceholderUrl(fullName),
                accountId,
            }
        );

        const loginSession = await account.createEmailPasswordSession(email, password);

        (await cookies()).set("appwrite-session", loginSession.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

    } catch (error) {
        handleError(error, "Failed to log in as demo user. Please try again in some time.");
    }
};