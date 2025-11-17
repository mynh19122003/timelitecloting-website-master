# Kiến trúc hệ thống E-commerce Backend

## 🏗️ Tổng quan kiến trúc

```mermaid
graph TB
    subgraph "Client Layer"
        C[Web Client]
        M[Mobile App]
        A[Admin Panel]
    end
    
    subgraph "Gateway Layer"
        G[Nginx Gateway<br/>Load Balancer]
    end
    
    subgraph "Application Layer"
        N[Node.js Backend<br/>Express + JWT]
        P[PHP Backend<br/>PHP-FPM + JWT]
    end
    
    subgraph "Data Layer"
        DB[(MySQL Database<br/>BẮT BUỘC)]
        PMA[phpMyAdmin<br/>Optional]
    end
    
    subgraph "Infrastructure Layer"
        D[Docker Swarm<br/>Orchestration]
        V[Volumes<br/>Data Persistence]
    end
    
    C --> G
    M --> G
    A --> G
    
    G --> N
    G --> P
    
    N --> DB
    P --> DB
    
    PMA --> DB
    
    D --> G
    D --> N
    D --> P
    D --> DB
    D --> PMA
    
    DB --> V
```

## 🔄 Luồng xử lý request

### 1. Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant G as Gateway
    participant N as Node.js Backend
    participant P as PHP Backend
    participant DB as MySQL Database
    
    C->>G: POST /api/users/register
    G->>N: Forward to Node.js
    N->>DB: Check email exists
    DB-->>N: Email not found
    N->>DB: Create user with bcrypt hash
    DB-->>N: User created with UID0000{n}
    N->>N: Generate JWT token (8h)
    N-->>G: Return user + token
    G-->>C: 201 Created
    
    C->>G: POST /api/users/login
    G->>P: Forward to PHP
    P->>DB: Find user by email
    DB-->>P: User data + hash
    P->>P: Verify bcrypt password
    P->>P: Generate JWT token (8h)
    P-->>G: Return user + token
    G-->>C: 200 OK
```

### 2. Order Creation Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant G as Gateway
    participant N as Node.js Backend
    participant DB as MySQL Database
    
    C->>G: POST /api/orders (with JWT)
    G->>G: Validate JWT token
    G->>N: Forward request
    N->>N: Verify JWT token
    N->>DB: BEGIN TRANSACTION
    N->>DB: Check product stock
    DB-->>N: Stock available
    N->>DB: Create order
    N->>DB: Create order_items
    N->>DB: Update product stock
    N->>DB: COMMIT TRANSACTION
    N-->>G: Order created
    G-->>C: 201 Created
```

## 🗄️ Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        varchar user_code UK
        varchar email UK
        varchar password_hash
        timestamp created_at
    }
    
    PRODUCTS {
        int id PK
        varchar name
        text description
        decimal price
        int stock
        varchar image_url
        timestamp created_at
    }
    
    ORDERS {
        int id PK
        int user_id FK
        decimal total_amount
        enum status
        timestamp created_at
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
        timestamp created_at
    }
    
    USERS ||--o{ ORDERS : "places"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered_in"
```

### Database Triggers

```sql
-- Auto-generate user_code after user insert
CREATE TRIGGER tr_users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    UPDATE users 
    SET user_code = CONCAT('UID', LPAD(NEW.id, 5, '0'))
    WHERE id = NEW.id;
END;

-- Update stock after order item insert
CREATE TRIGGER tr_order_items_after_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products 
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
END;
```

## 🔐 Security Architecture

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 1,
    "userCode": "UID00001",
    "email": "user@example.com",
    "iat": 1640995200,
    "exp": 1641024000
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}
```

### Authentication Flow

```mermaid
graph LR
    A[Client Request] --> B{Has Token?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D[Verify JWT]
    D --> E{Valid?}
    E -->|No| F[401 Invalid Token]
    E -->|Yes| G[Extract User Info]
    G --> H[Process Request]
```

## 🚀 Deployment Architecture

### Docker Swarm Stack

```mermaid
graph TB
    subgraph "Manager Node"
        M1[Manager 1]
        M2[Manager 2]
    end
    
    subgraph "Worker Nodes"
        W1[Worker 1]
        W2[Worker 2]
        W3[Worker 3]
    end
    
    subgraph "Services"
        G[Gateway: 2 replicas]
        N[Node.js: 3 replicas]
        P[PHP: 3 replicas]
        DB[MySQL: 1 replica]
        PMA[phpMyAdmin: 1 replica]
    end
    
    M1 --> G
    M2 --> G
    W1 --> N
    W2 --> N
    W3 --> N
    W1 --> P
    W2 --> P
    W3 --> P
    M1 --> DB
    M1 --> PMA
```

### Load Balancing Strategy

```mermaid
graph LR
    A[Client] --> B[Nginx Gateway]
    B --> C{Route Type}
    C -->|/api/users| D[Node.js Backend]
    C -->|/api/products| E[PHP Backend]
    C -->|/api/orders| F[Node.js Backend]
    C -->|Default| G[Round Robin]
    G --> D
    G --> E
```

## 📊 Monitoring & Observability

### Health Check Endpoints

```mermaid
graph TB
    A[Health Check] --> B[Gateway: /health]
    A --> C[Node.js: /health]
    A --> D[PHP: Built-in]
    A --> E[MySQL: mysqladmin ping]
    
    B --> F[200 OK]
    C --> G[200 OK]
    D --> H[200 OK]
    E --> I[0 Exit Code]
```

### Logging Strategy

```mermaid
graph LR
    A[Application Logs] --> B[Container Logs]
    B --> C[Docker Logs]
    C --> D[Centralized Logging]
    
    E[Error Logs] --> F[Error Tracking]
    F --> G[Alerting]
    
    H[Access Logs] --> I[Analytics]
    I --> J[Performance Metrics]
```

## 🔄 Data Flow Patterns

### Stateless Design

```mermaid
graph TB
    A[Request 1] --> B[Node.js Instance 1]
    C[Request 2] --> D[Node.js Instance 2]
    E[Request 3] --> F[Node.js Instance 3]
    
    B --> G[MySQL Database]
    D --> G
    F --> G
    
    H[JWT Token] --> I[Stateless Auth]
    I --> J[Any Instance]
```

### Transaction Management

```mermaid
sequenceDiagram
    participant A as Application
    participant DB as MySQL
    
    A->>DB: BEGIN TRANSACTION
    A->>DB: SELECT stock FROM products WHERE id = ?
    DB-->>A: stock = 10
    A->>A: Check stock >= quantity
    A->>DB: INSERT INTO orders (user_id, total_amount)
    A->>DB: INSERT INTO order_items (order_id, product_id, quantity, price)
    A->>DB: UPDATE products SET stock = stock - quantity
    A->>DB: COMMIT TRANSACTION
    DB-->>A: Success
```

## 🎯 Performance Considerations

### Caching Strategy

```mermaid
graph TB
    A[Client Request] --> B{Check Cache}
    B -->|Hit| C[Return Cached Data]
    B -->|Miss| D[Query Database]
    D --> E[Update Cache]
    E --> F[Return Data]
```

### Database Optimization

```sql
-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_code ON users(user_code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

## 🔧 Configuration Management

### Environment-based Configuration

```mermaid
graph TB
    A[Environment Variables] --> B[Development]
    A --> C[Staging]
    A --> D[Production]
    
    B --> E[Local MySQL]
    C --> F[Staging MySQL]
    D --> G[Production MySQL]
    
    B --> H[Debug Logging]
    C --> I[Info Logging]
    D --> J[Error Logging]
```

## 🚨 Error Handling Strategy

### Error Response Flow

```mermaid
graph TB
    A[Error Occurs] --> B{Error Type}
    B -->|Validation| C[400 Bad Request]
    B -->|Authentication| D[401 Unauthorized]
    B -->|Authorization| E[403 Forbidden]
    B -->|Not Found| F[404 Not Found]
    B -->|Conflict| G[409 Conflict]
    B -->|Server Error| H[500 Internal Server Error]
    
    C --> I[ERR_VALIDATION_FAILED]
    D --> J[ERR_INVALID_TOKEN]
    E --> K[ERR_FORBIDDEN]
    F --> L[ERR_NOT_FOUND]
    G --> M[ERR_EMAIL_EXISTS]
    H --> N[ERR_INTERNAL_SERVER_ERROR]
```

---

**⚠️ Lưu ý**: Kiến trúc này được thiết kế để đảm bảo tính nhất quán dữ liệu và khả năng mở rộng cao, với MySQL làm database chính duy nhất.
