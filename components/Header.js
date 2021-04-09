import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import get from "lodash.get";
import { Action, Image, Link, SideDrawer } from ".";
import { Container, Hidden } from "@material-ui/core";
import MaterialUISearch from "./search/MaterialUISearch";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  logo: {
    width: "200px",
  },
  mainMenu: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "flex-end",
    "& a": {
      margin: theme.spacing(1),
    }
  }
}));

function Header(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar color="transparent" position="sticky">
        <Container>
          <Toolbar>
            <Link href='/' className={classes.logo}>
              {get(props, "data.config.header_logo.value[0]")
                ? (<Image
                  asset={get(props, "data.config.header_logo.value[0]")}
                  src={get(props, "data.config.header_logo.value[0].url")}
                  alt={get(props, "data.config.title.value", null)}
                  width="200"
                  height="60"
                />)
                : (<Typography variant="h6">{get(props, "data.config.title.value", null)}</Typography>)
              }
            </Link>
            <Hidden smDown>
              <div className={classes.mainMenu}>
                <MaterialUISearch {...props}/>
                {get(props, "data.config.main_menu.value[0].actions.value", []).map((navigationItem, index) => (
                  <Action key={index} action={navigationItem} {...props} />
                ))}
              </div>
            </Hidden>
            <Hidden mdUp>
              <div className={classes.mainMenu}>
                <SideDrawer navLinks={get(props, "data.config.main_menu.value[0].actions.value", [])} {...props} />
              </div>
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>
    </div >
  );
}

export default Header;
