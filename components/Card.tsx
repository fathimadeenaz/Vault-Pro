import Link from "next/link";
import { Models } from "node-appwrite";

import ActionDropdown from "@/components/ActionDropdown";
import FormattedDateTime from "@/components/FormattedDateTime";
import Thumbnail from "@/components/Thumbnail";
import { isDemoUser } from "@/lib/actions/user.actions";
import { convertFileSize } from "@/lib/utils";

const Card = async ({ file }: { file: Models.Document }) => {
    const status = await isDemoUser()

    return (
        <Link href={file.url} target="_blank" className="file-card">
            <div className="flex justify-between">
                <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="!size-20"
                />
                <div className="flex flex-col items-end justify-between">
                    <ActionDropdown file={file} status={status} />
                    <p className="body-1">{convertFileSize(file.size)}</p>
                </div>
            </div>
            <div className="file-card-details">
                <p className="subtitle-2 line-clamp-1">{file.name}</p>
                <FormattedDateTime
                    date={file.$createdAt}
                    className="body-2 text-light-100"
                />
                <p className="caption line-clamp-1 text-light-200">
                    By: {file.owner.fullName}
                </p>
            </div>
        </Link>
    );
};
export default Card;