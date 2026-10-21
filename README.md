# Field Standard — Easy Groceries (Full-Stack Grocery Store)

A full-stack online grocery store: a single-page storefront backed by a PHP/MySQL service layer with accounts, login, and a department/product catalogue.

## What's here

- **`index.html`** — the single-page storefront: home, shop by department, product views, cart, and account screens (sign up, log in, forgot password), all in one page app.
- **`services/`** — the PHP API the page talks to:
  - `easy_groceries.class.php` — the core class: catalogue queries, account creation, and login with salted, peppered SHA-1 password hashing
  - `get_departments.php`, `get_department.php`, `get_product.php` — catalogue endpoints returning JSON
  - `create_account.php`, `login.php` — account endpoints
- **`assets/`** — the storefront's styles and scripts (`app.css`, `main.js`, plus the Foundation framework files the site was built on) and the interface images under `assets/img/`.
- **`images/`** — department photography, hero images, and icons used by the storefront.

## Running it

The class expects a PDO connection file at `services/inc/connect_pdo.php` providing `$dbo` (a PDO instance) and `$pepper` (the password pepper). That file is intentionally **not** in this repo — it held the live database credentials. Create it locally, create the MySQL schema (users, departments, products), and serve the folder with any PHP-capable host.

## Status

Published as a **code case study** — the original hosting and database are retired, so there is no live demo. The credentials file and server error logs were deliberately excluded from this repo. The full product catalogue photo set and the original database dump are intentionally not published: the dump contains real customer data from the retired store.

## Tech

- HTML, CSS, JavaScript (single-page interface)
- PHP (PDO), MySQL
- JSON service endpoints
