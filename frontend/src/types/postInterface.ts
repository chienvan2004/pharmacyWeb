import { Topic } from "./topicInterface";

export interface Post {
    id: number;
    title: string;
    slug: string | null;
    topic_id: number;
    content: string;
    image: string | null;
    type: 'post' | 'page';
    active: boolean;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    topic: Topic;
}

