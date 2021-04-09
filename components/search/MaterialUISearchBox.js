import { InputBase } from "@material-ui/core";


function MaterialUISearchBox({
  currentRefinement,
  isSearchStalled,
  refine,
}) {

  return (
    <>
      <InputBase
        placeholder="Search…"
        inputProps={{ "aria-label": "search" }}
        value={currentRefinement}
        onChange={(e) => refine(e.currentTarget.value)}
      />
      {isSearchStalled ? "My search is stalled" : ""}
    </>
  );
}

export default MaterialUISearchBox;
