export interface Course {
    id: string;
    name: string;
    description: string;
    userId: {
        id: number;
        firstName: string,
        lastName: string,
    };
}

export interface CoursePagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}