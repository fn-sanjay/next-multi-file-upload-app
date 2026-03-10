export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Cloud Vault API",
    version: "1.0.0",
    description: "JWT + CSRF auth API with credentials and Google OAuth support, file management, folder organization, sharing, and admin features.",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      csrfHeader: {
        type: "apiKey",
        in: "header",
        name: "x-csrf-token",
      },
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "user@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string", example: "clx123abc" },
              name: { type: "string", example: "User" },
              email: { type: "string", example: "user@example.com" },
              role: {
                type: "string",
                enum: ["USER", "ADMIN"],
                example: "USER",
              },
            },
          },
        },
      },
      StorageStats: {
        type: "object",
        properties: {
          totalUsed: {
            type: "integer",
            format: "int64",
            description: "Total storage used across all users",
          },
          imagesSize: {
            type: "integer",
            format: "int64",
            description: "Total storage used by image files",
          },
          videosSize: {
            type: "integer",
            format: "int64",
            description: "Total storage used by video files",
          },
          docsSize: {
            type: "integer",
            format: "int64",
            description: "Total storage used by documents",
          },
          othersSize: {
            type: "integer",
            format: "int64",
            description: "Total storage used by other file types",
          },
          nodesActive: {
            type: "integer",
            description: "Number of active storage nodes",
          },
          nodesTotal: {
            type: "integer",
            description: "Total storage nodes available",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      UploadInitRequest: {
        type: "object",
        required: ["filename", "size", "hash"],
        properties: {
          filename: {
            type: "string",
            example: "video.mp4",
          },
          size: {
            type: "integer",
            example: 52428800,
          },
          hash: {
            type: "string",
            example: "sha256hash",
          },
          folderId: {
            type: "string",
            nullable: true,
          },
        },
      },

      UploadInitResponse: {
        type: "object",
        properties: {
          uploadId: {
            type: "string",
            example: "upload_session_uuid",
          },
          chunkSize: {
            type: "integer",
            example: 5242880,
          },
        },
      },

      UploadChunkResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
        },
      },

      UploadCompleteResponse: {
        type: "object",
        properties: {
          file: {
            type: "object",
          },
        },
      },
      File: {
        type: "object",
        properties: {
          id: { type: "string" },
          filename: { type: "string", example: "document.pdf" },
          folderId: { type: "string", nullable: true },
          isFavorite: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      FileListResponse: {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: { $ref: "#/components/schemas/File" },
          },
        },
      },

      FileResponse: {
        type: "object",
        properties: {
          file: { $ref: "#/components/schemas/File" },
        },
      },

      BatchMoveRequest: {
        type: "object",
        required: ["action"],
        properties: {
          action: {
            type: "string",
            enum: ["move", "delete", "favorite", "restore"],
          },
          destinationFolderId: {
            type: "string",
            nullable: true,
          },
          files: {
            type: "array",
            items: { type: "string" },
          },
          folders: {
            type: "array",
            items: { type: "string" },
          },
        },
      },

      BatchResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Items moved successfully",
          },
        },
      },

      FileTreeNode: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          parentId: { type: "string", nullable: true },
          folders: {
            type: "array",
            items: { $ref: "#/components/schemas/FileTreeNode" },
          },
          files: {
            type: "array",
            items: { $ref: "#/components/schemas/File" },
          },
        },
      },

      FileTreeResponse: {
        type: "object",
        properties: {
          folders: {
            type: "array",
            items: { $ref: "#/components/schemas/FileTreeNode" },
          },
        },
      },
      Folder: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "clx_folder_123",
          },
          name: {
            type: "string",
            example: "Projects",
          },
          parentId: {
            type: "string",
            nullable: true,
            example: null,
          },
          userId: {
            type: "string",
            example: "user_123",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          deletedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },

      FolderResponse: {
        type: "object",
        properties: {
          folder: {
            $ref: "#/components/schemas/Folder",
          },
        },
      },

      FolderListResponse: {
        type: "object",
        properties: {
          folders: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Folder",
            },
          },
        },
      },

      CreateFolderRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            example: "Backend",
          },
          parentId: {
            type: "string",
            nullable: true,
            example: null,
          },
        },
      },

      UpdateFolderRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Backend Services",
          },
          parentId: {
            type: "string",
            nullable: true,
            example: "folder_123",
          },
        },
      },

      BatchFolderRequest: {
        type: "object",
        required: ["action", "folders"],
        properties: {
          action: {
            type: "string",
            enum: ["move", "delete", "restore"],
          },
          destinationFolderId: {
            type: "string",
            nullable: true,
          },
          folders: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },

      FolderTreeNode: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          parentId: { type: "string", nullable: true },
          children: {
            type: "array",
            items: {
              $ref: "#/components/schemas/FolderTreeNode",
            },
          },
        },
      },

      FolderTreeResponse: {
        type: "object",
        properties: {
          folders: {
            type: "array",
            items: {
              $ref: "#/components/schemas/FolderTreeNode",
            },
          },
        },
      },
      Tag: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "tag_uuid_123",
          },
          name: {
            type: "string",
            example: "Important",
          },
          color: {
            type: "string",
            example: "#FF5733",
          },
          userId: {
            type: "string",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      TagResponse: {
        type: "object",
        properties: {
          tag: {
            $ref: "#/components/schemas/Tag",
          },
        },
      },

      TagListResponse: {
        type: "object",
        properties: {
          tags: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Tag",
            },
          },
        },
      },

      CreateTagRequest: {
        type: "object",
        required: ["name", "color"],
        properties: {
          name: {
            type: "string",
            example: "Work",
          },
          color: {
            type: "string",
            example: "#22C55E",
          },
        },
      },

      UpdateTagRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Personal",
          },
          color: {
            type: "string",
            example: "#3B82F6",
          },
        },
      },

      AttachTagToFileRequest: {
        type: "object",
        required: ["fileId", "tagId"],
        properties: {
          fileId: {
            type: "string",
            example: "file_uuid",
          },
          tagId: {
            type: "string",
            example: "tag_uuid",
          },
        },
      },

      AttachTagToFolderRequest: {
        type: "object",
        required: ["folderId", "tagId"],
        properties: {
          folderId: {
            type: "string",
            example: "folder_uuid",
          },
          tagId: {
            type: "string",
            example: "tag_uuid",
          },
        },
      },
      RecentFile: {
        type: "object",
        properties: {
          id: { type: "string" },
          filename: { type: "string" },
          folderId: { type: "string", nullable: true },
        },
      },

      RecentFolder: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          parentId: { type: "string", nullable: true },
        },
      },

      RecentAccess: {
        type: "object",
        properties: {
          id: { type: "string" },

          file: {
            $ref: "#/components/schemas/RecentFile",
            nullable: true,
          },

          folder: {
            $ref: "#/components/schemas/RecentFolder",
            nullable: true,
          },

          accessedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      RecentAccessResponse: {
        type: "object",
        properties: {
          recent: {
            type: "array",
            items: {
              $ref: "#/components/schemas/RecentAccess",
            },
          },
        },
      },

      CreateRecentAccessRequest: {
        type: "object",
        properties: {
          fileId: {
            type: "string",
            example: "file_uuid",
          },
          folderId: {
            type: "string",
            example: "folder_uuid",
          },
        },
      },
      StorageUsage: {
        type: "object",
        properties: {
          totalUsed: {
            type: "string",
            description: "Total storage used in bytes",
            example: "2684354560",
          },
          quota: {
            type: "string",
            description: "User storage quota in bytes",
            example: "10737418240",
          },
          imagesSize: {
            type: "string",
            example: "1288490188",
          },
          videosSize: {
            type: "string",
            example: "536870912",
          },
          docsSize: {
            type: "string",
            example: "644245094",
          },
          othersSize: {
            type: "string",
            example: "214748364",
          },
        },
      },
      UserStorageRequest: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          requestedQuota: {
            type: "string",
            description: "Requested storage quota in bytes",
            example: "21474836480",
          },
          reason: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["PENDING", "APPROVED", "REJECTED"],
          },
          approvedById: { type: "string", nullable: true },
          approvedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      UserStorageRequestListResponse: {
        type: "object",
        properties: {
          requests: {
            type: "array",
            items: {
              $ref: "#/components/schemas/UserStorageRequest",
            },
          },
        },
      },
      CreateStorageRequestRequest: {
        type: "object",
        required: ["requestedQuota"],
        properties: {
          requestedQuota: {
            type: "string",
            example: "21474836480",
          },
          reason: {
            type: "string",
            example: "Need more space for video assets",
          },
        },
      },
    },
    SupportTicket: {
      type: "object",
      properties: {
        id: { type: "string" },
        subject: { type: "string" },
        message: { type: "string" },
        status: {
          type: "string",
          enum: ["OPEN", "CLOSED"],
          example: "OPEN",
        },
        createdAt: {
          type: "string",
          format: "date-time",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
        },
      },
    },

    SupportReply: {
      type: "object",
      properties: {
        id: { type: "string" },
        message: { type: "string" },
        createdAt: {
          type: "string",
          format: "date-time",
        },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            role: { type: "string" },
          },
        },
      },
    },

    SupportTicketResponse: {
      type: "object",
      properties: {
        ticket: {
          $ref: "#/components/schemas/SupportTicket",
        },
      },
    },

    SupportTicketListResponse: {
      type: "object",
      properties: {
        tickets: {
          type: "array",
          items: {
            $ref: "#/components/schemas/SupportTicket",
          },
        },
      },
    },

    CreateSupportTicketRequest: {
      type: "object",
      required: ["subject", "message"],
      properties: {
        subject: {
          type: "string",
          example: "Unable to upload file",
        },
        message: {
          type: "string",
          example: "When uploading a video it fails with an error.",
        },
      },
    },

    ReplySupportTicketRequest: {
      type: "object",
      required: ["message"],
      properties: {
        message: {
          type: "string",
          example: "Here is additional information about the issue.",
        },
      },
    },
    AdminClientQueryUser: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
      },
    },

    AdminClientQuery: {
      type: "object",
      properties: {
        id: { type: "string" },
        subject: { type: "string" },
        message: { type: "string" },
        status: {
          type: "string",
          enum: ["OPEN", "CLOSED"],
        },
        createdAt: {
          type: "string",
          format: "date-time",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
        },
        user: {
          $ref: "#/components/schemas/AdminClientQueryUser",
        },
      },
    },

    AdminClientQueryListResponse: {
      type: "object",
      properties: {
        queries: {
          type: "array",
          items: {
            $ref: "#/components/schemas/AdminClientQuery",
          },
        },
        total: {
          type: "integer",
          example: 12,
        },
      },
    },

    AdminReplyClientQueryRequest: {
      type: "object",
      required: ["reply"],
      properties: {
        reply: {
          type: "string",
          example: "We have fixed the issue. Please try again.",
        },
        close: {
          type: "boolean",
          example: true,
        },
      },
    },
    AdminStorageRequestUser: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        storageQuota: {
          type: "string",
          description: "Current storage quota of the user in bytes",
          example: "10737418240",
        },
      },
    },

    AdminStorageRequest: {
      type: "object",
      properties: {
        id: { type: "string" },
        userId: { type: "string" },

        requestedQuota: {
          type: "string",
          description: "Requested storage quota in bytes",
          example: "21474836480",
        },

        reason: {
          type: "string",
          nullable: true,
        },

        status: {
          type: "string",
          enum: ["PENDING", "APPROVED", "REJECTED"],
        },

        createdAt: {
          type: "string",
          format: "date-time",
        },

        reviewedAt: {
          type: "string",
          format: "date-time",
          nullable: true,
        },

        user: {
          $ref: "#/components/schemas/AdminStorageRequestUser",
        },
      },
    },

    AdminStorageRequestListResponse: {
      type: "object",
      properties: {
        requests: {
          type: "array",
          items: {
            $ref: "#/components/schemas/AdminStorageRequest",
          },
        },
        total: {
          type: "integer",
          example: 10,
        },
      },
    },

    AdminStorageRequestAction: {
      type: "object",
      required: ["action"],
      properties: {
        action: {
          type: "string",
          enum: ["APPROVE", "REJECT"],
          example: "APPROVE",
        },
      },
    },
  },
  paths: {
    "/api/docs": {
      get: {
        summary: "Get OpenAPI spec",
        tags: ["Docs"],
        responses: {
          "200": {
            description: "OpenAPI JSON spec",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
        },
      },
    },
    "/api/docs/ui": {
      get: {
        summary: "Swagger UI",
        tags: ["Docs"],
        responses: {
          "200": {
            description: "Swagger UI HTML",
          },
        },
      },
    },
    "/api/auth/csrf": {
      get: {
        summary: "Get CSRF token",
        tags: ["Auth"],
        responses: {
          "200": {
            description: "CSRF token generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    csrfToken: {
                      type: "string",
                      example: "abc123csrf",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/verify-email": {
      get: {
        summary: "Verify email address",
        description: "User clicks email verification link to activate account",
        tags: ["Auth"],
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "Email verification token sent to the user's email",
          },
        ],
        responses: {
          "200": {
            description: "Email verified successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Email verified successfully",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid or expired token",
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        summary: "Sign up (credentials)",
        tags: ["Auth"],
        security: [{ csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  name: {
                    type: "string",
                    example: "User",
                  },
                  email: {
                    type: "string",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    example: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created. Verification email sent.",
          },
          "409": {
            description: "Email already registered",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login with email and password",
        tags: ["Auth"],
        security: [{ csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse",
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
          },
          "403": {
            description: "CSRF or email verification error",
          },
        },
      },
    },

    "/api/auth/me": {
      get: {
        summary: "Get current authenticated user",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "clx123abc" },
                        name: { type: "string", example: "Sanjay" },
                        email: { type: "string", example: "sanjay@gmail.com" },
                        role: { type: "string", example: "USER" },
                        provider: { type: "string", example: "CREDENTIALS" },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                          example: "2026-03-06T06:00:00.000Z",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "Unauthorized" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Logout current user",
        tags: ["Auth"],
        security: [{ csrfHeader: [] }],
        responses: {
          "200": {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },
          "403": {
            description: "Invalid CSRF token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Invalid CSRF token",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/refresh-token": {
      post: {
        summary: "Refresh access token using refresh token",
        tags: ["Auth"],
        security: [{ csrfHeader: [] }],
        responses: {
          "200": {
            description: "Tokens refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized (invalid or expired refresh token)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Unauthorized",
                    },
                  },
                },
              },
            },
          },
          "403": {
            description: "Invalid CSRF token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Invalid CSRF token",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/forgot-password": {
      post: {
        summary: "Request password reset email",
        tags: ["Auth"],
        security: [{ csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    example: "user@example.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Reset email sent",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/reset-password": {
      post: {
        summary: "Reset password using reset token",
        tags: ["Auth"],
        security: [{ csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "newPassword"],
                properties: {
                  token: {
                    type: "string",
                    example: "abc123resetToken",
                  },
                  newPassword: {
                    type: "string",
                    example: "newStrongPassword123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid or expired token",
          },
        },
      },
    },

    "/api/auth/google": {
      get: {
        summary: "Start Google OAuth login",
        description:
          "Redirects the user to Google OAuth consent screen. After login Google will redirect to /api/auth/google/callback.",
        tags: ["Auth"],
        responses: {
          "302": {
            description: "Redirect to Google OAuth",
          },
          "500": {
            description: "Missing Google OAuth configuration",
          },
        },
      },
    },
    "/api/auth/google/callback": {
      get: {
        summary: "Google OAuth callback",
        description:
          "Google redirects here after successful authentication. This endpoint exchanges the code for tokens and logs the user in.",
        tags: ["Auth"],
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "Authorization code returned by Google",
          },
          {
            name: "state",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "OAuth state value used for CSRF protection",
          },
        ],
        responses: {
          "302": {
            description: "Redirect to application after login",
          },
          "400": {
            description: "OAuth verification failed",
          },
          "500": {
            description: "OAuth configuration error",
          },
        },
      },
    },
    "/api/user/uploads/init": {
      post: {
        summary: "Initialize resumable upload",
        tags: ["Uploads"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UploadInitRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Upload session created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UploadInitResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/user/uploads/chunk": {
      post: {
        summary: "Upload file chunk",
        tags: ["Uploads"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  uploadId: {
                    type: "string",
                  },
                  partNumber: {
                    type: "integer",
                  },
                  chunk: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Chunk uploaded",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UploadChunkResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/user/uploads/complete": {
      post: {
        summary: "Complete upload session",
        tags: ["Uploads"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  uploadId: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Upload completed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UploadCompleteResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/user/files": {
      get: {
        summary: "List user files",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "folderId", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "isFavorite", in: "query", schema: { type: "boolean" } },
          { name: "isArchived", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          "200": {
            description: "Files fetched",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FileListResponse",
                },
              },
            },
          },
        },
      },

      post: {
        summary: "Create file metadata",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["filename", "blobId"],
                properties: {
                  filename: { type: "string" },
                  folderId: { type: "string", nullable: true },
                  blobId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "File created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FileResponse" },
              },
            },
          },
        },
      },
    },
    "/api/user/files/{id}": {
      get: {
        summary: "Get file details",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "File details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FileResponse" },
              },
            },
          },
        },
      },

      patch: {
        summary: "Update file metadata",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  filename: { type: "string" },
                  folderId: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "File updated",
          },
        },
      },

      delete: {
        summary: "Delete or trash file",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "File deleted",
          },
        },
      },
    },
    "/api/user/files/{id}/download": {
      get: {
        summary: "Get download URL",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Signed download URL",
          },
        },
      },
    },

    "/api/user/files/{id}/preview": {
      get: {
        summary: "Get preview URL",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Preview URL generated",
          },
        },
      },
    },
    "/api/user/files/{id}/favorite": {
      post: {
        summary: "Mark file as favorite",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "File marked favorite" },
        },
      },

      delete: {
        summary: "Remove favorite",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Favorite removed" },
        },
      },
    },

    "/api/user/files/{id}/trash": {
      post: {
        summary: "Move file to trash",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "File moved to trash" },
        },
      },

      delete: {
        summary: "Restore file from trash",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "File restored" },
        },
      },
    },
    "/api/user/files/batch": {
      post: {
        summary: "Batch file operations",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BatchMoveRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Batch operation completed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BatchResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/user/folders": {
      get: {
        summary: "List folders",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "parentId",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Folders fetched",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FolderListResponse",
                },
              },
            },
          },
        },
      },

      post: {
        summary: "Create folder",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateFolderRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Folder created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FolderResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/user/folders/{id}": {
      get: {
        summary: "Get folder details",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Folder details",
          },
        },
      },

      patch: {
        summary: "Update folder",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateFolderRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Folder updated",
          },
        },
      },

      delete: {
        summary: "Delete folder",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Folder deleted",
          },
        },
      },
    },
    "/api/user/folders/tree": {
      get: {
        summary: "Get folder tree",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Folder tree returned",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FolderTreeResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/user/folders/batch": {
      post: {
        summary: "Batch folder operations",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BatchFolderRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Batch operation completed",
          },
        },
      },
    },
    "/api/user/folders/{id}/trash": {
      post: {
        summary: "Move folder to trash",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Folder moved to trash",
          },
        },
      },
    },
    "/api/user/folders/{id}/restore": {
      post: {
        summary: "Restore folder from trash",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Folder restored",
          },
        },
      },
    },
    "/api/user/folders/{id}/favorite": {
      post: {
        summary: "Mark folder as favorite",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Folder marked favorite",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FolderResponse",
                },
              },
            },
          },
          "404": {
            description: "Folder not found",
          },
        },
      },
      delete: {
        summary: "Remove folder favorite",
        tags: ["Folders"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Folder favorite removed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FolderResponse",
                },
              },
            },
          },
          "404": {
            description: "Folder not found",
          },
        },
      },
    },
    "/api/user/tags": {
      get: {
        summary: "List all user tags",
        tags: ["Tags"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Tags fetched",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TagListResponse",
                },
              },
            },
          },
        },
      },

      post: {
        summary: "Create a new tag",
        tags: ["Tags"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateTagRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Tag created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TagResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation error or max tags exceeded",
          },
          "409": {
            description: "Duplicate tag name",
          },
        },
      },
    },
    "/api/user/tags/{id}": {
      patch: {
        summary: "Update tag",
        tags: ["Tags"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateTagRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tag updated",
          },
        },
      },

      delete: {
        summary: "Delete tag",
        tags: ["Tags"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Tag deleted",
          },
        },
      },
    },
    "/api/user/tags/files": {
      post: {
        summary: "Attach tag to file",
        tags: ["Tags"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AttachTagToFileRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tag attached to file",
          },
          "400": {
            description: "File already has 3 tags",
          },
        },
      },
    },
    "/api/user/tags/folders": {
      post: {
        summary: "Attach tag to folder",
        tags: ["Tags"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AttachTagToFolderRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tag attached to folder",
          },
          "400": {
            description: "Folder already has 3 tags",
          },
        },
      },
    },
    "/api/user/search": {
      get: {
        summary: "Search files, folders, and tags",
        tags: ["Search"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Search results returned",
          },
        },
      },
    },
    "/api/user/recent": {
      get: {
        summary: "Get recently accessed files and folders",
        tags: ["Recent"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Recent items returned",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RecentAccessResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },

      post: {
        summary: "Record recent access for file or folder",
        tags: ["Recent"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateRecentAccessRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Recent access recorded",
          },
          "400": {
            description: "Invalid request data",
          },
          "404": {
            description: "File or folder not found",
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/api/user/storage-requests": {
      get: {
        summary: "List storage quota requests",
        tags: ["Storage"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Storage requests fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserStorageRequestListResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
      post: {
        summary: "Create storage quota request",
        tags: ["Storage"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateStorageRequestRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Storage request created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    request: {
                      $ref: "#/components/schemas/UserStorageRequest",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request",
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/api/user/storage-usage": {
      get: {
        summary: "Get user storage usage statistics",
        tags: ["Storage"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Storage usage fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StorageUsage",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/api/user/support-tickets": {
      get: {
        summary: "List user support tickets",
        tags: ["Support"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Support tickets fetched",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SupportTicketListResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },

      post: {
        summary: "Create a support ticket",
        tags: ["Support"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateSupportTicketRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Support ticket created",
          },
          "400": {
            description: "Invalid request",
          },
          "401": {
            description: "Unauthorized",
          },
        },
        },
      },
    "/api/user/support-tickets/{id}": {
      get: {
        summary: "Get support ticket details",
        tags: ["Support"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Support ticket returned",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SupportTicketResponse",
                },
              },
            },
          },
          "404": {
            description: "Ticket not found",
          },
        },
      },

      post: {
        summary: "Reply to a support ticket",
        tags: ["Support"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ReplySupportTicketRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Reply created",
          },
          "400": {
            description: "Ticket closed or invalid message",
          },
          "404": {
            description: "Ticket not found",
          },
        },
      },
    },
    "/api/admin/client-queries": {
      get: {
        summary: "List client support queries",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["all", "OPEN", "CLOSED"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Client queries fetched",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminClientQueryListResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "403": {
            description: "Admin access required",
          },
        },
      },
    },
    "/api/admin/client-queries/{id}": {
      patch: {
        summary: "Reply to a client query",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AdminReplyClientQueryRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Query replied successfully",
          },
          "400": {
            description: "Invalid request",
          },
          "404": {
            description: "Query not found",
          },
          "403": {
            description: "Admin access required",
          },
        },
      },
    },
    "/api/admin/storage-requests": {
  get: {
    summary: "List storage quota requests",
    description: "Returns all user storage quota requests with optional status filtering.",
    tags: ["Admin"],
    security: [{ bearerAuth: [] }],

    parameters: [
      {
        name: "status",
        in: "query",
        required: false,
        schema: {
          type: "string",
          enum: ["all", "PENDING", "APPROVED", "REJECTED"]
        },
        description: "Filter storage requests by status"
      }
    ],

    responses: {
      "200": {
        description: "Storage requests fetched successfully",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AdminStorageRequestListResponse"
            }
          }
        }
      },

      "400": {
        description: "Invalid query parameters"
      },

      "401": {
        description: "Unauthorized"
      },

      "403": {
        description: "Admin access required"
      }
    }
  }
},
"/api/admin/storage-requests/{id}": {
  patch: {
    summary: "Approve or reject storage request",
    description: "Admin reviews a storage quota request and either approves or rejects it.",
    tags: ["Admin"],
    security: [{ bearerAuth: [] }],

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "string"
        },
        description: "Storage request ID"
      }
    ],

    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/AdminStorageRequestAction"
          }
        }
      }
    },

    responses: {
      "200": {
        description: "Storage request processed successfully"
      },

      "400": {
        description: "Invalid request body or request already processed"
      },

      "404": {
        description: "Storage request not found"
      },

      "401": {
        description: "Unauthorized"
      },

      "403": {
        description: "Admin access required"
      }
    }
  }
},

    "/api/admin/storage-stats": {
      get: {
        summary: "System storage statistics",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Aggregated storage stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalUsers: { type: "integer" },
                    totalLimitBytes: { type: "integer", format: "int64" },
                    totalUsedBytes: { type: "integer", format: "int64" },
                    usage: {
                      type: "object",
                      properties: {
                        images: { type: "object", properties: { bytes: { type: "integer" }, count: { type: "integer" } } },
                        docs: { type: "object", properties: { bytes: { type: "integer" }, count: { type: "integer" } } },
                        video: { type: "object", properties: { bytes: { type: "integer" }, count: { type: "integer" } } },
                        audio: { type: "object", properties: { bytes: { type: "integer" }, count: { type: "integer" } } },
                        others: { type: "object", properties: { bytes: { type: "integer" }, count: { type: "integer" } } },
                        trash: { type: "object", properties: { bytes: { type: "integer" }, count: { type: "integer" } } },
                      },
                    },
                    users: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string", nullable: true },
                          email: { type: "string" },
                          storageQuota: { type: "string" },
                          usedBytes: { type: "integer", format: "int64" },
                          usedCount: { type: "integer" },
                          trashBytes: { type: "integer", format: "int64" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/users": {
      get: {
        summary: "List users (admin)",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Users returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string", nullable: true },
                          email: { type: "string" },
                          role: { type: "string" },
                          storageUsed: { type: "string" },
                          storageQuota: { type: "string" },
                          isReadOnly: { type: "boolean" },
                          isBanned: { type: "boolean" },
                          createdAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/users/{id}": {
      patch: {
        summary: "Update user flags/quota",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  isReadOnly: { type: "boolean" },
                  isBanned: { type: "boolean" },
                  storageQuota: { type: "integer", format: "int64" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "404": { description: "User not found" },
        },
      },
      delete: {
        summary: "Soft delete user",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Deleted (soft)" },
          "404": { description: "User not found" },
        },
      },
    },
    "/api/user/profile": {
      patch: {
        summary: "Update user profile",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Alex Rivera" },
                  bio: { type: "string", example: "Design lead" },
                  avatarUrl: { type: "string", example: "https://example.com/avatar.png" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Profile updated" },
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
        },
      },
    }
  },
} as const;
