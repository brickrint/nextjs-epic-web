import { NoteEditor } from "../../_components/note-editor";
import { create } from "../actions";

export default async function NewNote() {
  return <NoteEditor action={create} />;
}
