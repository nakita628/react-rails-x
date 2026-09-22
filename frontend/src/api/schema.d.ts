export interface paths {
    "/api/link_preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** show */
        get: {
            parameters: {
                query?: {
                    /** @example https://example.com/plain */
                    url?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description description だけのページ */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "url": "https://example.com/plain",
                         *       "title": null,
                         *       "description": "Just a description",
                         *       "image": null,
                         *       "siteName": null
                         *     }
                         */
                        "application/json": {
                            url: string;
                            title: string | null;
                            description: string | null;
                            image: string | null;
                            siteName: string | null;
                        };
                    };
                };
                /** @description 内部アドレスは 400 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/bad-request",
                         *       "title": "Bad Request",
                         *       "status": 400,
                         *       "detail": "Internal destinations are not allowed",
                         *       "instance": "/api/link_preview"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/media/{prefix}/{filename}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** show */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example cpeku3elamwpowahruk8ipw2.png */
                    filename: string;
                    /** @example posts */
                    prefix: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description アップロードした画像はサインインなしで配信される */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "image/png": File;
                    };
                };
                /** @description 存在しない画像は 404 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** index */
        get: {
            parameters: {
                query?: {
                    /** @example first */
                    page?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 自分の通知が新しい順に返る */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example [
                         *       {
                         *         "id": 729887420,
                         *         "type": "like",
                         *         "read": false,
                         *         "from": {
                         *           "id": 902541635,
                         *           "username": "bob",
                         *           "fullName": "Bob",
                         *           "profileImg": "/api/media/avatars/fixture.png"
                         *         },
                         *         "createdAt": "2026-01-02T01:00:00.000Z"
                         *       },
                         *       {
                         *         "id": 698582621,
                         *         "type": "follow",
                         *         "read": false,
                         *         "from": {
                         *           "id": 708742340,
                         *           "username": "carol",
                         *           "fullName": "Carol",
                         *           "profileImg": "/api/media/avatars/fixture.png"
                         *         },
                         *         "createdAt": "2026-01-01T01:00:00.000Z"
                         *       }
                         *     ]
                         */
                        "application/json": {
                            id: number;
                            type: string;
                            read: boolean;
                            from: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: string;
                            };
                            /** Format: date-time */
                            createdAt: string;
                        }[];
                    };
                };
                /** @description page は 1 以上 */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unprocessable-content",
                         *       "title": "Unprocessable Content",
                         *       "status": 422,
                         *       "detail": "The request failed validation. See `errors` for the offending fields.",
                         *       "instance": "/api/notifications",
                         *       "errors": [
                         *         {
                         *           "field": "page",
                         *           "message": "Page must be an integer of 1 or more"
                         *         }
                         *       ]
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                            errors: {
                                field: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /** destroy */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description すべて削除する */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        /** update */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /** @example {} */
                    "application/x-www-form-urlencoded": Record<string, never>;
                };
            };
            responses: {
                /** @description すべて既読にする */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** index */
        get: {
            parameters: {
                query?: {
                    /** @example alice */
                    author?: string;
                    /** @example following */
                    feed?: string;
                    /** @example bob */
                    likedBy?: string;
                    /** @example 2 */
                    page?: number;
                    /** @example 0 */
                    rows?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 投稿者を指定した一覧 */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example [
                         *       {
                         *         "id": 169311211,
                         *         "text": "hello from alice",
                         *         "img": null,
                         *         "author": {
                         *           "id": 663665735,
                         *           "username": "alice",
                         *           "fullName": "Alice",
                         *           "profileImg": null
                         *         },
                         *         "likeCount": 1,
                         *         "liked": true,
                         *         "repostCount": 1,
                         *         "reposted": false,
                         *         "bookmarked": true,
                         *         "comments": [
                         *           {
                         *             "id": 632426790,
                         *             "text": "Nice post!",
                         *             "author": {
                         *               "id": 902541635,
                         *               "username": "bob",
                         *               "fullName": "Bob",
                         *               "profileImg": "/api/media/avatars/fixture.png"
                         *             },
                         *             "createdAt": "2026-01-02T02:00:00.000Z"
                         *           }
                         *         ],
                         *         "createdAt": "2026-01-02T00:00:00.000Z",
                         *         "updatedAt": "2026-01-02T00:00:00.000Z"
                         *       }
                         *     ]
                         */
                        "application/json": {
                            id: number;
                            text: string | null;
                            img: string | null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: string | null;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: {
                                id: number;
                                text: string;
                                author: {
                                    id: number;
                                    username: string;
                                    fullName: string;
                                    profileImg: string;
                                };
                                /** Format: date-time */
                                createdAt: string;
                            }[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                            repostedBy?: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: string;
                            } | null;
                        }[];
                    };
                };
                /** @description 一覧にはサインインが要る */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unauthorized",
                         *       "title": "Unauthorized",
                         *       "status": 401,
                         *       "detail": "Sign-in required",
                         *       "instance": "/api/posts"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
                /** @description feed は決まった値のどれか */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unprocessable-content",
                         *       "title": "Unprocessable Content",
                         *       "status": 422,
                         *       "detail": "The request failed validation. See `errors` for the offending fields.",
                         *       "instance": "/api/posts",
                         *       "errors": [
                         *         {
                         *           "field": "feed",
                         *           "message": "Feed must be one of all, following, bookmarks"
                         *         }
                         *       ]
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                            errors: {
                                field: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
        };
        put?: never;
        /** create */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /**
                     * @example {
                     *       "text": "just words"
                     *     }
                     */
                    "application/x-www-form-urlencoded": {
                        text: string;
                    };
                    /**
                     * @example {
                     *       "text": "with an image",
                     *       "img": "pixel.png"
                     *     }
                     */
                    "multipart/form-data": {
                        text?: string;
                        /** Format: binary */
                        img: File;
                    };
                };
            };
            responses: {
                /** @description 画像だけで投稿する */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 833395933,
                         *       "text": null,
                         *       "img": "/api/media/posts/jpctttvmx5kmafzns2fb3hkr.png",
                         *       "author": {
                         *         "id": 902541635,
                         *         "username": "bob",
                         *         "fullName": "Bob",
                         *         "profileImg": "/api/media/avatars/fixture.png"
                         *       },
                         *       "likeCount": 0,
                         *       "liked": false,
                         *       "repostCount": 0,
                         *       "reposted": false,
                         *       "bookmarked": false,
                         *       "comments": [],
                         *       "createdAt": "2026-09-22T13:12:00.820Z",
                         *       "updatedAt": "2026-09-22T13:12:00.820Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            text: string | null;
                            img: string | null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: string;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: unknown[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
                    };
                };
                /** @description 投稿にはテキストか画像が要る */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unprocessable-content",
                         *       "title": "Unprocessable Content",
                         *       "status": 422,
                         *       "detail": "The request failed validation. See `errors` for the offending fields.",
                         *       "instance": "/api/posts",
                         *       "errors": [
                         *         {
                         *           "field": "text",
                         *           "message": "Text or an image is required"
                         *         }
                         *       ]
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                            errors: {
                                field: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/posts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** show */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example 0 */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 投稿を 1 件取得する */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 169311211,
                         *       "text": "hello from alice",
                         *       "img": null,
                         *       "author": {
                         *         "id": 663665735,
                         *         "username": "alice",
                         *         "fullName": "Alice",
                         *         "profileImg": null
                         *       },
                         *       "likeCount": 1,
                         *       "liked": true,
                         *       "repostCount": 1,
                         *       "reposted": false,
                         *       "bookmarked": true,
                         *       "comments": [
                         *         {
                         *           "id": 632426790,
                         *           "text": "Nice post!",
                         *           "author": {
                         *             "id": 902541635,
                         *             "username": "bob",
                         *             "fullName": "Bob",
                         *             "profileImg": "/api/media/avatars/fixture.png"
                         *           },
                         *           "createdAt": "2026-01-02T02:00:00.000Z"
                         *         }
                         *       ],
                         *       "createdAt": "2026-01-02T00:00:00.000Z",
                         *       "updatedAt": "2026-01-02T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            text: string;
                            img: null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: null;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: {
                                id: number;
                                text: string;
                                author: {
                                    id: number;
                                    username: string;
                                    fullName: string;
                                    profileImg: string;
                                };
                                /** Format: date-time */
                                createdAt: string;
                            }[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
                    };
                };
                /** @description 存在しない投稿は 404 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/not-found",
                         *       "title": "Not Found",
                         *       "status": 404,
                         *       "detail": "Resource not found",
                         *       "instance": "/api/posts/0"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /** destroy */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example 222676662 */
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 投稿者は自分の投稿を削除できる */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 他人の投稿は削除できない */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/forbidden",
                         *       "title": "Forbidden",
                         *       "status": 403,
                         *       "detail": "You can only delete your own posts",
                         *       "instance": "/api/posts/169311211"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/posts/{post_id}/bookmark": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** create */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example 222676662 */
                    post_id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /** @example {} */
                    "application/x-www-form-urlencoded": Record<string, never>;
                };
            };
            responses: {
                /** @description 投稿をブックマークする */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 222676662,
                         *       "text": "hello from bob",
                         *       "img": null,
                         *       "author": {
                         *         "id": 902541635,
                         *         "username": "bob",
                         *         "fullName": "Bob",
                         *         "profileImg": "/api/media/avatars/fixture.png"
                         *       },
                         *       "likeCount": 0,
                         *       "liked": false,
                         *       "repostCount": 0,
                         *       "reposted": false,
                         *       "bookmarked": true,
                         *       "comments": [],
                         *       "createdAt": "2026-01-03T00:00:00.000Z",
                         *       "updatedAt": "2026-01-03T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            text: string;
                            img: null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: string;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: unknown[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
                    };
                };
            };
        };
        /** destroy */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example 169311211 */
                    post_id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description ブックマークを外す */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 169311211,
                         *       "text": "hello from alice",
                         *       "img": null,
                         *       "author": {
                         *         "id": 663665735,
                         *         "username": "alice",
                         *         "fullName": "Alice",
                         *         "profileImg": null
                         *       },
                         *       "likeCount": 1,
                         *       "liked": true,
                         *       "repostCount": 1,
                         *       "reposted": false,
                         *       "bookmarked": false,
                         *       "comments": [
                         *         {
                         *           "id": 632426790,
                         *           "text": "Nice post!",
                         *           "author": {
                         *             "id": 902541635,
                         *             "username": "bob",
                         *             "fullName": "Bob",
                         *             "profileImg": "/api/media/avatars/fixture.png"
                         *           },
                         *           "createdAt": "2026-01-02T02:00:00.000Z"
                         *         }
                         *       ],
                         *       "createdAt": "2026-01-02T00:00:00.000Z",
                         *       "updatedAt": "2026-01-02T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            text: string;
                            img: null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: null;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: {
                                id: number;
                                text: string;
                                author: {
                                    id: number;
                                    username: string;
                                    fullName: string;
                                    profileImg: string;
                                };
                                /** Format: date-time */
                                createdAt: string;
                            }[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/posts/{post_id}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** create */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example 169311211 */
                    post_id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /**
                     * @example {
                     *       "text": "  Me too!  "
                     *     }
                     */
                    "application/json": {
                        text: string;
                    };
                };
            };
            responses: {
                /** @description コメントすると投稿とそのコメント一覧が返る */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 169311211,
                         *       "text": "hello from alice",
                         *       "img": null,
                         *       "author": {
                         *         "id": 663665735,
                         *         "username": "alice",
                         *         "fullName": "Alice",
                         *         "profileImg": null
                         *       },
                         *       "likeCount": 1,
                         *       "liked": false,
                         *       "repostCount": 1,
                         *       "reposted": true,
                         *       "bookmarked": false,
                         *       "comments": [
                         *         {
                         *           "id": 632426790,
                         *           "text": "Nice post!",
                         *           "author": {
                         *             "id": 902541635,
                         *             "username": "bob",
                         *             "fullName": "Bob",
                         *             "profileImg": "/api/media/avatars/fixture.png"
                         *           },
                         *           "createdAt": "2026-01-02T02:00:00.000Z"
                         *         },
                         *         {
                         *           "id": 632426791,
                         *           "text": "Me too!",
                         *           "author": {
                         *             "id": 708742340,
                         *             "username": "carol",
                         *             "fullName": "Carol",
                         *             "profileImg": "/api/media/avatars/fixture.png"
                         *           },
                         *           "createdAt": "2026-09-22T13:12:01.114Z"
                         *         }
                         *       ],
                         *       "createdAt": "2026-01-02T00:00:00.000Z",
                         *       "updatedAt": "2026-01-02T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            text: string;
                            img: null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: null;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: {
                                id: number;
                                text: string;
                                author: {
                                    id: number;
                                    username: string;
                                    fullName: string;
                                    profileImg: string;
                                };
                                /** Format: date-time */
                                createdAt: string;
                            }[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
                    };
                };
                /** @description コメントは 1〜280 文字 */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unprocessable-content",
                         *       "title": "Unprocessable Content",
                         *       "status": 422,
                         *       "detail": "The request failed validation. See `errors` for the offending fields.",
                         *       "instance": "/api/posts/169311211/comments",
                         *       "errors": [
                         *         {
                         *           "field": "text",
                         *           "message": "Comment must be 280 characters or fewer"
                         *         }
                         *       ]
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                            errors: {
                                field: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/posts/{post_id}/like": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** create */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example 169311211 */
                    post_id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /** @example {} */
                    "application/x-www-form-urlencoded": Record<string, never>;
                };
            };
            responses: {
                /** @description いいねすると初回だけ投稿者に通知される */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 169311211,
                         *       "text": "hello from alice",
                         *       "img": null,
                         *       "author": {
                         *         "id": 663665735,
                         *         "username": "alice",
                         *         "fullName": "Alice",
                         *         "profileImg": null
                         *       },
                         *       "likeCount": 2,
                         *       "liked": true,
                         *       "repostCount": 1,
                         *       "reposted": true,
                         *       "bookmarked": false,
                         *       "comments": [
                         *         {
                         *           "id": 632426790,
                         *           "text": "Nice post!",
                         *           "author": {
                         *             "id": 902541635,
                         *             "username": "bob",
                         *             "fullName": "Bob",
                         *             "profileImg": "/api/media/avatars/fixture.png"
                         *           },
                         *           "createdAt": "2026-01-02T02:00:00.000Z"
                         *         }
                         *       ],
                         *       "createdAt": "2026-01-02T00:00:00.000Z",
                         *       "updatedAt": "2026-01-02T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            text: string;
                            img: null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: null;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: {
                                id: number;
                                text: string;
                                author: {
                                    id: number;
                                    username: string;
                                    fullName: string;
                                    profileImg: string;
                                };
                                /** Format: date-time */
                                createdAt: string;
                            }[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
                    };
                };
                /** @description 存在しない投稿へのいいねは 404 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/not-found",
                         *       "title": "Not Found",
                         *       "status": 404,
                         *       "detail": "Resource not found",
                         *       "instance": "/api/posts/0/like"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        /** destroy */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example 169311211 */
                    post_id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description いいねを取り消す */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 169311211,
                         *       "text": "hello from alice",
                         *       "img": null,
                         *       "author": {
                         *         "id": 663665735,
                         *         "username": "alice",
                         *         "fullName": "Alice",
                         *         "profileImg": null
                         *       },
                         *       "likeCount": 0,
                         *       "liked": false,
                         *       "repostCount": 1,
                         *       "reposted": false,
                         *       "bookmarked": true,
                         *       "comments": [
                         *         {
                         *           "id": 632426790,
                         *           "text": "Nice post!",
                         *           "author": {
                         *             "id": 902541635,
                         *             "username": "bob",
                         *             "fullName": "Bob",
                         *             "profileImg": "/api/media/avatars/fixture.png"
                         *           },
                         *           "createdAt": "2026-01-02T02:00:00.000Z"
                         *         }
                         *       ],
                         *       "createdAt": "2026-01-02T00:00:00.000Z",
                         *       "updatedAt": "2026-01-02T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            text: string;
                            img: null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: null;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: {
                                id: number;
                                text: string;
                                author: {
                                    id: number;
                                    username: string;
                                    fullName: string;
                                    profileImg: string;
                                };
                                /** Format: date-time */
                                createdAt: string;
                            }[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/posts/{post_id}/repost": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** create */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example 169311211 */
                    post_id: number;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /** @example {} */
                    "application/x-www-form-urlencoded": Record<string, never>;
                };
            };
            responses: {
                /** @description 投稿をリポストする */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 169311211,
                         *       "text": "hello from alice",
                         *       "img": null,
                         *       "author": {
                         *         "id": 663665735,
                         *         "username": "alice",
                         *         "fullName": "Alice",
                         *         "profileImg": null
                         *       },
                         *       "likeCount": 1,
                         *       "liked": true,
                         *       "repostCount": 2,
                         *       "reposted": true,
                         *       "bookmarked": true,
                         *       "comments": [
                         *         {
                         *           "id": 632426790,
                         *           "text": "Nice post!",
                         *           "author": {
                         *             "id": 902541635,
                         *             "username": "bob",
                         *             "fullName": "Bob",
                         *             "profileImg": "/api/media/avatars/fixture.png"
                         *           },
                         *           "createdAt": "2026-01-02T02:00:00.000Z"
                         *         }
                         *       ],
                         *       "createdAt": "2026-01-02T00:00:00.000Z",
                         *       "updatedAt": "2026-01-02T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            text: string;
                            img: null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: null;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: {
                                id: number;
                                text: string;
                                author: {
                                    id: number;
                                    username: string;
                                    fullName: string;
                                    profileImg: string;
                                };
                                /** Format: date-time */
                                createdAt: string;
                            }[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
                    };
                };
            };
        };
        /** destroy */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example 169311211 */
                    post_id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description リポストを取り消す */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 169311211,
                         *       "text": "hello from alice",
                         *       "img": null,
                         *       "author": {
                         *         "id": 663665735,
                         *         "username": "alice",
                         *         "fullName": "Alice",
                         *         "profileImg": null
                         *       },
                         *       "likeCount": 1,
                         *       "liked": false,
                         *       "repostCount": 0,
                         *       "reposted": false,
                         *       "bookmarked": false,
                         *       "comments": [
                         *         {
                         *           "id": 632426790,
                         *           "text": "Nice post!",
                         *           "author": {
                         *             "id": 902541635,
                         *             "username": "bob",
                         *             "fullName": "Bob",
                         *             "profileImg": "/api/media/avatars/fixture.png"
                         *           },
                         *           "createdAt": "2026-01-02T02:00:00.000Z"
                         *         }
                         *       ],
                         *       "createdAt": "2026-01-02T00:00:00.000Z",
                         *       "updatedAt": "2026-01-02T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            text: string;
                            img: null;
                            author: {
                                id: number;
                                username: string;
                                fullName: string;
                                profileImg: null;
                            };
                            likeCount: number;
                            liked: boolean;
                            repostCount: number;
                            reposted: boolean;
                            bookmarked: boolean;
                            comments: {
                                id: number;
                                text: string;
                                author: {
                                    id: number;
                                    username: string;
                                    fullName: string;
                                    profileImg: string;
                                };
                                /** Format: date-time */
                                createdAt: string;
                            }[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** show */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description プロフィールにはプロフィール画像とカバー画像の URL が載る */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 902541635,
                         *       "username": "bob",
                         *       "fullName": "Bob",
                         *       "profileImg": "/api/media/avatars/fixture.png",
                         *       "emailAddress": "bob@example.com",
                         *       "coverImg": "/api/media/covers/fixture.png",
                         *       "bio": "",
                         *       "link": ""
                         *     }
                         */
                        "application/json": {
                            id: number;
                            username: string;
                            fullName: string;
                            profileImg: string | null;
                            emailAddress: string;
                            coverImg: string | null;
                            bio: string;
                            link: string;
                        };
                    };
                };
                /** @description サインアウトするとセッションが終わる */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unauthorized",
                         *       "title": "Unauthorized",
                         *       "status": 401,
                         *       "detail": "Sign-in required",
                         *       "instance": "/api/profile"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /** destroy */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description アカウント削除にはサインインが要る */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unauthorized",
                         *       "title": "Unauthorized",
                         *       "status": 401,
                         *       "detail": "Sign-in required",
                         *       "instance": "/api/profile"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /** update */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /**
                     * @example {
                     *       "currentPassword": "secret123",
                     *       "newPassword": "secret456",
                     *       "fullName": "Alice B"
                     *     }
                     */
                    "application/x-www-form-urlencoded": {
                        currentPassword?: string;
                        newPassword?: string;
                        fullName?: string;
                    };
                    /**
                     * @example {
                     *       "fullName": "Alice B",
                     *       "bio": "hi",
                     *       "link": "https://example.com",
                     *       "profileImg": "pixel.png",
                     *       "currentPassword": "secret123",
                     *       "newPassword": "secret456",
                     *       "coverImg": "pixel.png"
                     *     }
                     */
                    "multipart/form-data": {
                        fullName?: string;
                        bio?: string;
                        link?: string;
                        /** Format: binary */
                        profileImg: File;
                        currentPassword?: string;
                        newPassword?: string;
                        /** Format: binary */
                        coverImg?: File;
                    };
                };
            };
            responses: {
                /** @description 画像だけ更新する */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 663665735,
                         *       "username": "alice",
                         *       "fullName": "Alice",
                         *       "profileImg": "/api/media/avatars/iazmcm8shhmoni4ff4y6llgo.png",
                         *       "emailAddress": "alice@example.com",
                         *       "coverImg": "/api/media/covers/akkxyalmxdmephvxlmdyd3eu.png",
                         *       "bio": "Hi, I'm Alice.",
                         *       "link": ""
                         *     }
                         */
                        "application/json": {
                            id: number;
                            username: string;
                            fullName: string;
                            profileImg: string | null;
                            emailAddress: string;
                            coverImg: string | null;
                            bio: string;
                            link: string;
                        };
                    };
                };
                /** @description パスワード変更には現在のパスワードが要る */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unauthorized",
                         *       "title": "Unauthorized",
                         *       "status": 401,
                         *       "detail": "Current password is incorrect",
                         *       "instance": "/api/profile"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
                /** @description 不正な項目で更新すると項目ごとに列挙される */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unprocessable-content",
                         *       "title": "Unprocessable Content",
                         *       "status": 422,
                         *       "detail": "The request failed validation. See `errors` for the offending fields.",
                         *       "instance": "/api/profile",
                         *       "errors": [
                         *         {
                         *           "field": "link",
                         *           "message": "Link must be a URL starting with http:// or https://"
                         *         },
                         *         {
                         *           "field": "password",
                         *           "message": "Password must be 72 characters or fewer"
                         *         },
                         *         {
                         *           "field": "coverImg",
                         *           "message": "Cover image must be PNG, JPEG, WebP, or GIF"
                         *         }
                         *       ]
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                            errors: {
                                field: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/api/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** create */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /**
                     * @example {
                     *       "username": "bob",
                     *       "password": "secret123"
                     *     }
                     */
                    "application/json": {
                        username: string;
                        password: string;
                    };
                };
            };
            responses: {
                /** @description プロフィール画像のあるユーザーでサインインする */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 902541635,
                         *       "username": "bob",
                         *       "fullName": "Bob",
                         *       "profileImg": "/api/media/avatars/fixture.png",
                         *       "emailAddress": "bob@example.com",
                         *       "coverImg": "/api/media/covers/fixture.png",
                         *       "bio": "",
                         *       "link": ""
                         *     }
                         */
                        "application/json": {
                            id: number;
                            username: string;
                            fullName: string;
                            profileImg: string | null;
                            emailAddress: string;
                            coverImg: string | null;
                            bio: string;
                            link: string;
                        };
                    };
                };
                /** @description 間違ったパスワードでは 401 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unauthorized",
                         *       "title": "Unauthorized",
                         *       "status": 401,
                         *       "detail": "Try another username or password.",
                         *       "instance": "/api/session"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        /** destroy */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description セッションなしのサインアウトは 401 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unauthorized",
                         *       "title": "Unauthorized",
                         *       "status": 401,
                         *       "detail": "Sign-in required",
                         *       "instance": "/api/session"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** create */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /**
                     * @example {
                     *       "username": "dave",
                     *       "fullName": "Dave",
                     *       "emailAddress": "Dave@Example.com",
                     *       "password": "secret123"
                     *     }
                     */
                    "application/json": {
                        username: string;
                        fullName: string;
                        emailAddress: string;
                        password: string;
                    };
                };
            };
            responses: {
                /** @description サインアップするとユーザーが作られ、サインイン状態になる */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 902541636,
                         *       "username": "dave",
                         *       "fullName": "Dave",
                         *       "profileImg": null,
                         *       "emailAddress": "dave@example.com",
                         *       "coverImg": null,
                         *       "bio": "",
                         *       "link": ""
                         *     }
                         */
                        "application/json": {
                            id: number;
                            username: string;
                            fullName: string;
                            profileImg: null;
                            emailAddress: string;
                            coverImg: null;
                            bio: string;
                            link: string;
                        };
                    };
                };
                /** @description 使われているユーザー名やメールアドレスでのサインアップは 409 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/conflict",
                         *       "title": "Conflict",
                         *       "status": 409,
                         *       "detail": "That username or email address is already taken",
                         *       "instance": "/api/users"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
                /** @description 不正な項目でサインアップすると項目ごとに列挙される */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unprocessable-content",
                         *       "title": "Unprocessable Content",
                         *       "status": 422,
                         *       "detail": "The request failed validation. See `errors` for the offending fields.",
                         *       "instance": "/api/users",
                         *       "errors": [
                         *         {
                         *           "field": "username",
                         *           "message": "Username must be 15 characters or fewer and contain only letters, digits, and underscores"
                         *         },
                         *         {
                         *           "field": "fullName",
                         *           "message": "Full name can't be blank"
                         *         },
                         *         {
                         *           "field": "emailAddress",
                         *           "message": "Email address must be a valid email address"
                         *         },
                         *         {
                         *           "field": "password",
                         *           "message": "Password must be at least 6 characters"
                         *         }
                         *       ]
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                            errors: {
                                field: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/suggested": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** suggested */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description おすすめユーザーには自分とフォロー済みの人が含まれない */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example [
                         *       {
                         *         "id": 663665735,
                         *         "username": "alice",
                         *         "fullName": "Alice",
                         *         "profileImg": null,
                         *         "coverImg": null,
                         *         "bio": "Hi, I'm Alice.",
                         *         "link": "",
                         *         "followersCount": 0,
                         *         "followingCount": 1,
                         *         "isFollowing": false,
                         *         "createdAt": "2026-01-01T00:00:00.000Z"
                         *       },
                         *       {
                         *         "id": 902541635,
                         *         "username": "bob",
                         *         "fullName": "Bob",
                         *         "profileImg": "/api/media/avatars/fixture.png",
                         *         "coverImg": "/api/media/covers/fixture.png",
                         *         "bio": "",
                         *         "link": "",
                         *         "followersCount": 1,
                         *         "followingCount": 0,
                         *         "isFollowing": false,
                         *         "createdAt": "2026-01-01T00:00:00.000Z"
                         *       }
                         *     ]
                         */
                        "application/json": {
                            id: number;
                            username: string;
                            fullName: string;
                            profileImg: string | null;
                            coverImg: string | null;
                            bio: string;
                            link: string;
                            followersCount: number;
                            followingCount: number;
                            isFollowing: boolean;
                            /** Format: date-time */
                            createdAt: string;
                        }[];
                    };
                };
                /** @description おすすめユーザーにはサインインが要る */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unauthorized",
                         *       "title": "Unauthorized",
                         *       "status": 401,
                         *       "detail": "Sign-in required",
                         *       "instance": "/api/users/suggested"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/{username}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** show */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example nobody */
                    username: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description 画像のないプロフィール */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 663665735,
                         *       "username": "alice",
                         *       "fullName": "Alice",
                         *       "profileImg": null,
                         *       "coverImg": null,
                         *       "bio": "Hi, I'm Alice.",
                         *       "link": "",
                         *       "followersCount": 0,
                         *       "followingCount": 1,
                         *       "isFollowing": false,
                         *       "createdAt": "2026-01-01T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            username: string;
                            fullName: string;
                            profileImg: string | null;
                            coverImg: string | null;
                            bio: string;
                            link: string;
                            followersCount: number;
                            followingCount: number;
                            isFollowing: boolean;
                            /** Format: date-time */
                            createdAt: string;
                        };
                    };
                };
                /** @description 存在しないユーザー名は 404 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/not-found",
                         *       "title": "Not Found",
                         *       "status": 404,
                         *       "detail": "Resource not found",
                         *       "instance": "/api/users/nobody"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/{username}/follow": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** create */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example carol */
                    username: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    /** @example {} */
                    "application/x-www-form-urlencoded": Record<string, never>;
                };
            };
            responses: {
                /** @description フォローすると初回だけ相手に通知される */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 708742340,
                         *       "username": "carol",
                         *       "fullName": "Carol",
                         *       "profileImg": "/api/media/avatars/fixture.png",
                         *       "coverImg": "/api/media/covers/fixture.png",
                         *       "bio": "",
                         *       "link": "",
                         *       "followersCount": 1,
                         *       "followingCount": 0,
                         *       "isFollowing": true,
                         *       "createdAt": "2026-01-01T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            username: string;
                            fullName: string;
                            profileImg: string;
                            coverImg: string;
                            bio: string;
                            link: string;
                            followersCount: number;
                            followingCount: number;
                            isFollowing: boolean;
                            /** Format: date-time */
                            createdAt: string;
                        };
                    };
                };
                /** @description 自分自身のフォローは拒否される */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "/problems/unprocessable-content",
                         *       "title": "Unprocessable Content",
                         *       "status": 422,
                         *       "detail": "The request failed validation. See `errors` for the offending fields.",
                         *       "instance": "/api/users/alice/follow",
                         *       "errors": [
                         *         {
                         *           "field": "followingId",
                         *           "message": "Following cannot be yourself"
                         *         }
                         *       ]
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            status: number;
                            detail: string;
                            instance: string;
                            errors: {
                                field: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
        };
        /** destroy */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @example bob */
                    username: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description フォローを外す */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "id": 902541635,
                         *       "username": "bob",
                         *       "fullName": "Bob",
                         *       "profileImg": "/api/media/avatars/fixture.png",
                         *       "coverImg": "/api/media/covers/fixture.png",
                         *       "bio": "",
                         *       "link": "",
                         *       "followersCount": 0,
                         *       "followingCount": 0,
                         *       "isFollowing": false,
                         *       "createdAt": "2026-01-01T00:00:00.000Z"
                         *     }
                         */
                        "application/json": {
                            id: number;
                            username: string;
                            fullName: string;
                            profileImg: string;
                            coverImg: string;
                            bio: string;
                            link: string;
                            followersCount: number;
                            followingCount: number;
                            isFollowing: boolean;
                            /** Format: date-time */
                            createdAt: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
