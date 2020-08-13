export interface PostData {
    user?: User,
    likes ?: number;
    comments ?: Comment[];
    location ?: string;
}

export interface User {
    username ?: string;
    publicationCount ?: number;
    followerCount ?: number;
    followingCount ?: string;
}

export interface Comment {

}