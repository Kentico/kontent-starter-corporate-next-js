import { DeliveryClient } from "@kentico/kontent-delivery";

const client = new DeliveryClient({
  projectId: process.env.KONTENT_PROJECT_ID,
  previewApiKey: process.env.KONTENT_PREVIEW_API_KEY
});

export async function loadWebsiteConfig(preview = false) {
  const config = await client.item("homepage")
    .depthParameter(6)
    // This overfetching by ignoring `subpages` element
    // https://docs.kontent.ai/reference/delivery-api#tag/Projection
    .elementsParameter([
      "title", "base_font", "favicon", "palette", "label", "header_logo",
      "main_menu", "actions", "label", "slug", "content", "icon", "icon_position", "role",
      "options", "footer_sections", "image", "content", "fields", "name",
      "type", "value", "navigation_item", "url",
      "submit_label", "form_id", "form_action", "default_value", "configuration",
      "palette", "font", "copyright"
    ])
    .queryConfig({
      usePreviewMode: preview
    })
    .toPromise()
    .then(result => result.item);
  return config;
}

async function getSubPaths(pages, parentSlug, preview = false) {
  const paths = [];

  for (const page of pages) {
    const pageSlug = parentSlug.concat(page.slug.value);
    paths.push({
      params: {
        slug: pageSlug,
        info: page.system// will be ignored by next in getContentPaths
      }
    });

    // Listing pages
    const contentItem = page.content.value && page.content.value[0];
    if (contentItem && contentItem.system.type === "listing_page") {
      const subItems = await client.items()
        .type(contentItem.content_type.value)
        .elementsParameter(["slug"])
        .queryConfig({
          usePreviewMode: preview
        })
        .toPromise()
        .then(result => result.items);

      subItems.forEach(subItem => {
        const subItemSlug = pageSlug.concat(subItem.slug.value);
        paths.push({
          params: {
            slug: subItemSlug,
            info: subItem.system // will be ignored by next in getContentPaths
          }
        });
      });
    }

    const subPaths = await getSubPaths(page.subpages.value, pageSlug, preview);
    paths.push(...subPaths);
  }

  return paths;
}

export async function getSitemapMappings(preview = false) {
  const root = await client.item("homepage")
    .depthParameter(3) // depends on the sitemap level (+1 for content type to download)
    .elementsParameter(["subpages", "slug", "content", "content_type"])
    .queryConfig({
      usePreviewMode: preview
    })
    .toPromise()
    .then(result => result.item);

  const rootSlug = root.slug.value ? [root.slug.value] : [];
  const pathsFromKontent = [
    {
      params: {
        slug: rootSlug,
        info: root.system// will be ignored by next in getContentPaths
      }
    }
  ];

  const subPaths = await getSubPaths(root.subpages.value, rootSlug, preview);

  return pathsFromKontent.concat(...subPaths);
}


export async function getPageStaticPropsForPath(params, preview = false) {
  const config = await loadWebsiteConfig(preview); // TODO could be cached
  const mappings = await getSitemapMappings(preview); // TODO could be cached

  const slugValue = params && params.slug ? params.slug : [];

  const pathMapping = mappings.find(path => path.params.slug.join("#") === slugValue.join("#")); // condition works for array of basic values

  const itemSystemInfo = pathMapping && pathMapping.params.info;

  if (!itemSystemInfo) {
    return undefined;
  }

  const response = await client.item(itemSystemInfo.codename)
    .depthParameter(5)
    .queryConfig({
      usePreviewMode: preview
    })
    .toPromise();
  const item = response.item;

  const result = {
    page: JSON.parse(JSON.stringify(item)), // TODO #12
    linkedItems: JSON.parse(JSON.stringify(response.linkedItems)), // TODO #12
    data: {
      config: JSON.parse(JSON.stringify(config)), // TODO #12
      mappings: JSON.parse(JSON.stringify(mappings)), // TODO #12
    },
    related: {}
  };

  const isLandingPage =
    item.system.type !== "post"
    && item.content.value.length === 1
    && item.content.value[0].system.type === "landing_page";

  const isListingPage = item.system.type !== "post"
    && item.content.value.length === 1
    && item.content.value[0].system.type === "listing_page";

  if (isLandingPage) {
    const listingSections = item.content.value[0].sections.value
      .filter(section => section.system.type === "listing_section");

    for (const listingSection of listingSections) {
      const linkedItems = await client.items()
        .type(listingSection.content_type.value)
        .orderByDescending(listingSection.order_by.value)
        .limitParameter(listingSection.number_of_items.value)
        .queryConfig({
          usePreviewMode: preview
        })
        .toPromise()
        .then(result => result.items);

      result.related[listingSection.system.codename] = JSON.parse(JSON.stringify(linkedItems));  // TODO polish serialization of the js SDK response
    }
  } else if (isListingPage) {
    const listingPage = item.content.value[0];

    const linkedItems = await client.items()
      .type(listingPage.content_type.value)
      .queryConfig({
        usePreviewMode: preview
      })
      .toPromise()
      .then(result => result.items);

    result.related[listingPage.system.codename] = JSON.parse(JSON.stringify(linkedItems));  // TODO polish serialization of the js SDK response
  }

  return result;
}