import React from "react";
import get from "lodash.get";
import { Image, Link } from "..";
import { useTheme } from "@material-ui/core";
import { getUrlFromMapping } from "../../utils";

function Post(props) {
  const post = get(props, "item", null);
  const columnCount = get(props, "columnCount", 1);
  const postUrl = getUrlFromMapping(get(props, "data.mappings", []), get(post, "system.codename")) || "#";

  const theme = useTheme();
  const imageSizes = `(min-width: ${theme.breakpoints.values.md}px) ${Math.floor(100 / columnCount)}vw, 100vw`;

  return (
    <article>
      <div>
        {get(post, "image.value[0]", null) && (
          <Link href={postUrl}>
            <Image
              sizes={imageSizes}
              asset={(get(post, "image.value[0]", null))}
              alt={get(post, "image.value[0].description") || get(post, "image.value[0].name", null)} />
          </Link>
        )}
        <div>
          <header>
            <h3><Link href={postUrl}>{get(post, "title.value", null)}</Link></h3>
          </header>
          <div>
            <p>{get(post, "excerpt.value", null)}</p>
          </div>
          <footer>
            <time>{get(post, "publishing_date.value", null) && new Date(get(post, "publishing_date.value", null)).toDateString()}</time>
            {get(post, "author.value[0]", null) &&
              (", by " + get(post, "author.value[0].first_name.value", null) + " " + get(post, "author.value[0].last_name.value", null))}
          </footer>
        </div>
      </div>
    </article>
  );
}

export default Post;
