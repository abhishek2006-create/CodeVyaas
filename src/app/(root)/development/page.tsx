"use client";

import NavigationHeader from "@/components/NavigationHeader";
import AddNewButton from "@/app/(root)/development/components/add-new-button";
import AddRepo from "@/app/(root)/development/components/add-repo";
import ProjectTable from "./components/project-table";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <img src="/empty-state.svg" alt="No projects" className="w-48 h-48 mb-4" />

    <h2 className="text-xl font-semibold text-gray-500">No projects found</h2>

    <p className="text-gray-400">Create a new project to get started!</p>
  </div>
);

export default function DashboardMainPage() {
  const playgrounds = useQuery(api.playground.action.getPlaygrounds) ?? [];


  return (
    <>
      <NavigationHeader />

      <div className="bg-background flex flex-col gap-6 p-2 justify-center items-center">
        <h1 className="bg-[linear-gradient(to_right,var(--content-color),var(--primary))] text-transparent bg-clip-text mt-6 mb-6 font-bold text-5xl">
          Development
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          You can choose any template of your choice here and build a cool
          website like ours...
        </p>
      </div>

      <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <AddNewButton />
          <AddRepo />
        </div>

        <div className="mt-10 flex flex-col justify-center items-center w-full">
          {playgrounds.length === 0 ? (
            <EmptyState />
          ) : (
            <ProjectTable projects={playgrounds} />
          )}
        </div>
      </div>
    </>
  );
}
