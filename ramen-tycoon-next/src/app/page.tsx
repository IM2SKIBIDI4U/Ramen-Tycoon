import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <main className="flex min-h-full flex-col items-center justify-center p-8">
      <h1 className="mb-6 text-2xl font-semibold">Todos</h1>
      {error ? (
        <p role="alert">Could not load todos: {error.message}</p>
      ) : (
        <ul className="list-disc space-y-2 pl-6">
          {todos?.map((todo) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
