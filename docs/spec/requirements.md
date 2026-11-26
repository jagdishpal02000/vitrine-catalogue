# Requirements

The brief's acceptance criteria, restated in [EARS](https://kiro.dev/docs/specs/concepts) form
("WHEN … THE SYSTEM SHALL …"). Where the brief leaves a gap, the requirement records our assumption;
the reasoning is in [DECISIONS.md](../../DECISIONS.md).

## R1 Home page: top-rated products

> GIVEN I have chosen 5 products to be "top rated" WHEN I am viewing the home page THEN I see those 5 featured products

- **R1.1** WHEN a customer opens the home page THE SYSTEM SHALL show the products listed in `TOP_RATED_PRODUCT_IDS`, in that order.
- **R1.2** IF a listed product no longer exists THE SYSTEM SHALL skip it and log a warning.

## R2 Category page

> GIVEN my products are organised into categories WHEN I click on a category link THEN I see top rated products for that category AND I see additional products in that category

- **R2.1** THE SYSTEM SHALL show a link to every product category on every page.
- **R2.2** WHEN a customer opens a category THE SYSTEM SHALL show, as "Top rated", the owner's picks that belong to that category, in the owner's order.
- **R2.3** IF the owner picked no products in that category THE SYSTEM SHALL show its 3 best products by customer rating as "Top rated".
- **R2.4** THE SYSTEM SHALL show every other product in the category below, without repeating the top-rated ones.
- **R2.5** IF the category does not exist THE SYSTEM SHALL show a "not found" message.

## R3 Search

> GIVEN I am looking for a specific product AND I have entered a search term in the search bar WHEN I click the search button THEN I only see products that have text matching that search term

- **R3.1** WHEN a customer submits a search term (Search button or Enter) THE SYSTEM SHALL show only the products whose title, description or category contains every word of the term at the start of a word, ignoring case. For example, "jack" finds jackets but "men" does not find women's products.
- **R3.2** THE SYSTEM SHALL reject an empty term and any term longer than 100 characters.
- **R3.3** IF no product matches THE SYSTEM SHALL say so.

## R4 Product page

> GIVEN I am browsing the products AND I want to see more details about a specific product WHEN I click on a product tile THEN I see the product details page

- **R4.1** WHEN a customer clicks a product tile THE SYSTEM SHALL show that product's details: image, title, price, rating, description and category.
- **R4.2** IF the product does not exist THE SYSTEM SHALL show a "not found" message.

## R5 Enquiry

> GIVEN I am viewing a product AND I am interested in a product AND I click on the Enquire button AND I complete the subsequent form with my contact details WHEN I submit the form THEN the sales inbox will receive an email AND the customer will see a "Thank you" message

- **R5.1** WHEN a customer clicks Enquire on a product page THE SYSTEM SHALL show a form asking for name, email, phone (optional) and message (optional).
- **R5.2** WHEN the customer submits valid details THE SYSTEM SHALL email the sales inbox with the product and the customer's details, with Reply-To set to the customer, and then show a "Thank you" message.
- **R5.3** IF the details are invalid THE SYSTEM SHALL say what to fix and send nothing.
- **R5.4** IF the email cannot be sent THE SYSTEM SHALL show an error and let the customer try again; it SHALL NOT show "Thank you".
- **R5.5** THE SYSTEM SHALL accept at most 5 enquiries per IP address every 15 minutes.

## R6 Friendly error messages (added in review)

> The frontend should only show a user-friendly message, even when there is a 500 or something is broken: never an API route, or a controller or model name.

- **R6.1** WHEN anything fails THE SYSTEM SHALL show the customer a friendly, non-technical message. It SHALL NOT show API routes, error codes, stack traces or the API's own wording.
- **R6.2** IF a page breaks while rendering THE SYSTEM SHALL show a friendly error page with a way back, and keep the header working.
- **R6.3** THE API SHALL NOT echo request details in its error responses, and SHALL keep technical detail in its logs.

## Constraints (from the brief)

- **C1** A React web client and a Node.js (TypeScript) backend.
- **C2** The client never calls the Fake Store API. All product data goes through our backend.
- **C3** Any infrastructure must be AWS-compatible.
- **C4** A reviewer can run the solution locally in under 10 minutes, with one or two commands.
- **C5** No secrets are committed. Configuration is documented in `.env.example`.
- **C6** Nothing depends on paid services or accounts the reviewer would need to create.
- **C7** The product data source, look and feel and email provider are expected to change, so each sits behind a clear seam.
