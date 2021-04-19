import get from "lodash.get";
import { Layout, UnknownComponent } from "../components";
import { Container, Grid, makeStyles, Paper } from "@material-ui/core";
import Post from "../components/thumbnails/Post";


const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  thumbnailPaper: {
    height: "100%",
    padding: theme.spacing(2),
  }
}));

function getListingThumbnailComponent(contentType) {
  switch (contentType) {
    case "post":
      return Post;
    default:
      return null;
  }
}

function ListingPage(props) {
  const classes = useStyles();
  const page = get(props, "page", null);
  if (!page) {
    return (
      <UnknownComponent>
        Page {page.system.codename} does not have any content!
      </UnknownComponent>
    );
  }

  const relatedItems = get(props, `related[${page.system.codename}]`, []);

  return (
    <Layout {...props}>
      <Container className={classes.root}>
        {relatedItems.length > 0 &&
          <Grid container spacing={4} alignItems="stretch">
            {relatedItems.map((item, item_idx) => {
              const contentType = get(item, "system.type", null);
              const ThumbnailLayout = getListingThumbnailComponent(contentType);

              if (process.env.NODE_ENV === "development" && !ThumbnailLayout) {
                console.error(`Unknown section component for section content type: ${contentType}`);
                return (
                  <Grid item md={4} sm={12} key={item_idx}>
                    <Paper className={classes.thumbnailPaper}>
                      <UnknownComponent {...props}>
                        <pre>{JSON.stringify(item, undefined, 2)}</pre>
                      </UnknownComponent>
                    </Paper>

                  </Grid>
                );
              }

              return (
                <Grid variant="inbound" item md={4} sm={12} key={item_idx}>
                  <Paper className={classes.thumbnailPaper}>
                    <ThumbnailLayout  {...props} item={item} site={props} columnCount={3}/>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        }
      </Container>
    </Layout>
  );
}

export default ListingPage;