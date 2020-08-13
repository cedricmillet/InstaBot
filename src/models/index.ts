export interface PostData {
    user?: User,
    likes ?: number;
    comments ?: Comment[];
    location ?: string;
}

export interface User {
    username ?: string;
    fullname ?: string;
    profileURI ?: string;
}

export interface Comment {

}