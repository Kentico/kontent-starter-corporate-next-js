import React from 'react'
import get from 'lodash.get'
import { makeStyles, Typography } from '@material-ui/core';
import { CtaButtons } from '..';

const useStyles = makeStyles((theme) => ({
}));

function ContentSection(props) {
  const section = get(props, 'section', null);
  const classes = useStyles();


  return (
    <section id={get(section, 'system.codename', null)} className={classes.section}>
      {get(section, 'title', null) && (
        <Typography variant="h2">{get(section, 'title.value', null)}</Typography>
      )}

      {get(section, 'image.value[0]', null) && (
        <div className="cell block-preview">
          {/* TODO use Next Image Component */}
          <img width="100%" src={(get(section, 'image.value[0].url', null))} alt={get(section, 'image.value[0].description') || get(section, 'image.value[0].name', null)} />
        </div>
      )}

      {/* TODO: Create RichText element */}
      {get(section, 'content.value', null) && (
        <div className={classes.content} dangerouslySetInnerHTML={{ __html: get(section, 'content.value', null) }} />
      )}

      {get(section, 'actions', null) && (
        <div className={classes.actions}>
          <CtaButtons {...props} actions={get(section, 'actions.value', null)} />
        </div>
      )}
    </section>
  )
}

export default ContentSection