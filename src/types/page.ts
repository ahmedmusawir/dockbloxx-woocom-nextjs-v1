/**
 * Type definition for the home page data fetched from the WordPress REST API.
 *
 * This interface defines the expected structure of the ACF data, ensuring type safety when consuming
 * the API response in Next.js components.
 *
 * Fields:
 * - `section_3`: Represents a section of the home page containing structured content such as title, subtitle,
 *   content (HTML string), image URL, and button text.
 */
export interface HomeData {
  sections: {
    block_id: string;
    title: string;
    subtitle: string;
    content: string;
    image: string;
    button_text: string;
    button_link: string;
  }[];
}
