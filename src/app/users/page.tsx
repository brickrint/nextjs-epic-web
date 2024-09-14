import { SharedSearchBar as SearchBar } from "../_components/search-bar";
import { UsersList } from "./[username]/_components/users-list";

export default async function UsersPage({
  searchParams,
}: Readonly<{ searchParams: { search: string | undefined } }>) {
  const { search } = searchParams;

  return (
    <div className="container mb-48 mt-36 flex flex-col items-center justify-center gap-6">
      <h1 className="text-h1">Epic Notes Users</h1>
      <div className="w-full max-w-[700px]">
        <SearchBar autoFocus autoSubmit />
      </div>
      <main>
        <UsersList searchTerm={search} />
      </main>
    </div>
  );
}
