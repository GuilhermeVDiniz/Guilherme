# Requirements Document

## Introduction

Aplicação web moderna para gerenciamento de eventos de confraternização (churrasco entre amigos). O sistema permite criar eventos, gerenciar pagamentos via Pix, interação social com comentários e fotos, e inclui funcionalidades extras como ranking de contribuições, badges, checklist do churrasco e playlist colaborativa. Utiliza Next.js no frontend, Supabase (Auth + Database + Storage) no backend, e deploy na Vercel.

## Glossary

- **Churrasco_Manager**: O sistema web de gerenciamento de eventos de confraternização
- **Usuário**: Pessoa cadastrada no sistema que participa dos eventos
- **Admin**: Usuário com permissões elevadas para criar/editar eventos e gerenciar pagamentos
- **Evento**: Uma confraternização (churrasco) com data, local, horário e valor definido
- **Pagamento**: Registro financeiro de contribuição de um usuário para um evento
- **Comentário**: Mensagem publicada por um usuário no feed social de um evento
- **Foto**: Imagem enviada por um usuário associada a um evento, armazenada no Supabase Storage
- **Ranking**: Classificação dos usuários por valor total contribuído em um evento
- **Badge**: Emblema visual atribuído ao usuário que mais contribuiu em um evento
- **Checklist**: Lista de itens necessários para o churrasco com status de conclusão
- **QR Code Pix**: Código QR simulado para facilitar pagamentos via Pix
- **Countdown**: Contador regressivo exibindo dias, horas, minutos e segundos até o evento
- **Dashboard**: Página principal com resumo do evento e informações financeiras
- **Supabase**: Plataforma de backend que fornece autenticação, banco de dados PostgreSQL e armazenamento de arquivos
- **RLS (Row Level Security)**: Política de segurança do Supabase que restringe acesso a linhas do banco de dados com base no usuário autenticado

## Requirements

### Requirement 1

**User Story:** As a user, I want to register and log in with email and password, so that I can access the system securely.

#### Acceptance Criteria

1. WHEN a user submits a valid email and password on the registration form, THE Churrasco_Manager SHALL create a new user account using Supabase Auth and store the user profile in the users table with the role "user"
2. WHEN a user submits valid credentials on the login form, THE Churrasco_Manager SHALL authenticate the user via Supabase Auth and redirect to the dashboard
3. IF a user submits an invalid email format or a password shorter than 6 characters, THEN THE Churrasco_Manager SHALL display a specific validation error message and prevent form submission
4. WHEN a user accesses a protected route without authentication, THE Churrasco_Manager SHALL redirect the user to the login page

### Requirement 2

**User Story:** As a user, I want to see the event dashboard with key information, so that I can stay informed about the upcoming event.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to the dashboard, THE Churrasco_Manager SHALL display the event name, date, time, and location
2. WHEN the dashboard loads, THE Churrasco_Manager SHALL display a countdown timer showing days, hours, minutes, and seconds until the event date
3. WHEN the dashboard loads, THE Churrasco_Manager SHALL display the total required amount, total collected amount, and remaining amount for the event
4. WHEN no active event exists, THE Churrasco_Manager SHALL display a message indicating that no event is currently scheduled

### Requirement 3

**User Story:** As an authenticated user, I want to view my payment status and register payments, so that I can contribute to the event.

#### Acceptance Criteria

1. WHEN an authenticated user views the payment section, THE Churrasco_Manager SHALL display the total amount the user has paid and the remaining balance for the current event
2. WHEN a user clicks the payment registration button, THE Churrasco_Manager SHALL display a simulated QR Code Pix and a form to register the payment amount
3. WHEN a user submits a payment registration with a valid positive amount, THE Churrasco_Manager SHALL create a payment record with status "pending" linked to the user and the current event
4. WHEN a user views the payment history section, THE Churrasco_Manager SHALL display a chronological list of all payments made by that user for the current event, including amount, date, and status
5. IF a user submits a payment registration with a zero or negative amount, THEN THE Churrasco_Manager SHALL display a validation error and prevent the submission

### Requirement 4

**User Story:** As an admin, I want to manage events and payments, so that I can organize the event finances.

#### Acceptance Criteria

1. WHEN an admin accesses the event management page, THE Churrasco_Manager SHALL display a form to create a new event with fields for name, date, time, location, and total required amount
2. WHEN an admin submits a valid event creation form, THE Churrasco_Manager SHALL store the event in the eventos table and set it as the active event
3. WHEN an admin accesses the user management section, THE Churrasco_Manager SHALL display a list of all registered users with their total paid amount and remaining balance for the current event
4. WHEN an admin adds a manual payment for a user, THE Churrasco_Manager SHALL create a payment record with status "confirmed" linked to the specified user and event
5. WHEN an admin removes a payment, THE Churrasco_Manager SHALL delete the payment record and update the user balance accordingly

### Requirement 5

**User Story:** As a user, I want to interact socially through comments and photos, so that I can share experiences with other participants.

#### Acceptance Criteria

1. WHEN an authenticated user submits a comment on the event feed, THE Churrasco_Manager SHALL store the comment in the comentarios table linked to the user and event, and display it in the feed in reverse chronological order
2. WHEN an authenticated user uploads a photo, THE Churrasco_Manager SHALL store the image file in Supabase Storage and create a record in the fotos table linked to the user and event
3. IF a user uploads a file that is not an image (JPEG, PNG, or WebP) or exceeds 5 MB, THEN THE Churrasco_Manager SHALL reject the upload and display a specific error message
4. WHEN a user navigates to the gallery page, THE Churrasco_Manager SHALL display photos grouped by event year in a responsive grid layout

### Requirement 6

**User Story:** As a user, I want to see a contribution ranking and badges, so that I can see who contributed the most to the event.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE Churrasco_Manager SHALL display a ranking of users ordered by total confirmed payment amount in descending order for the current event
2. WHEN a user holds the highest total confirmed payment amount for the current event, THE Churrasco_Manager SHALL display the "Pagador Oficial do Churras" badge next to that user name in the ranking

### Requirement 7

**User Story:** As a user, I want a churrasco checklist, so that I can track what items are needed for the event.

#### Acceptance Criteria

1. WHEN an authenticated user views the checklist section, THE Churrasco_Manager SHALL display a list of checklist items for the current event with their completion status
2. WHEN an admin adds a checklist item with a valid non-empty description, THE Churrasco_Manager SHALL store the item in the database linked to the current event
3. WHEN a user toggles a checklist item, THE Churrasco_Manager SHALL update the completion status of that item in the database

### Requirement 8

**User Story:** As a user, I want to see an embedded collaborative playlist, so that I can enjoy and contribute to the event music.

#### Acceptance Criteria

1. WHEN an admin sets a Spotify playlist URL for the current event, THE Churrasco_Manager SHALL store the URL in the event record
2. WHEN the dashboard loads and a Spotify playlist URL exists for the current event, THE Churrasco_Manager SHALL render an embedded Spotify player using the stored URL

### Requirement 9

**User Story:** As a user, I want a modern, responsive, dark-themed interface with smooth animations, so that I have a pleasant experience using the application.

#### Acceptance Criteria

1. THE Churrasco_Manager SHALL render all pages using a dark color theme with consistent styling across components
2. THE Churrasco_Manager SHALL adapt the layout for mobile, tablet, and desktop screen sizes using responsive design techniques
3. WHEN page transitions or interactive elements are triggered, THE Churrasco_Manager SHALL apply smooth CSS or Framer Motion animations with duration under 500 milliseconds

### Requirement 10

**User Story:** As a system architect, I want the database schema to be well-structured and secure, so that data integrity and access control are maintained.

#### Acceptance Criteria

1. THE Churrasco_Manager SHALL maintain the following database tables: users, eventos, pagamentos, comentarios, fotos, and checklist_items
2. THE Churrasco_Manager SHALL enforce Row Level Security (RLS) policies on all tables so that users access only their own data and admins access all data
3. WHEN a payment record is created or deleted, THE Churrasco_Manager SHALL maintain consistency between individual payment records and the aggregated totals displayed on the dashboard

### Requirement 11

**User Story:** As a developer, I want the data models to be serializable to JSON, so that data can be transmitted between client and server reliably.

#### Acceptance Criteria

1. WHEN the system serializes any data model (User, Event, Payment, Comment, Photo, ChecklistItem) to JSON, THE Churrasco_Manager SHALL produce a valid JSON string that preserves all field values including dates and numeric types
2. WHEN the system deserializes a JSON string back into a data model, THE Churrasco_Manager SHALL reconstruct an object equivalent to the original, preserving all field values and types
