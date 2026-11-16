"use client";

import NavigationHeader from "@/components/NavigationHeader";
import AddNewButton from "@/app/(root)/development/components/add-new-button";
import AddRepo from "@/app/(root)/development/components/add-repo";
import ProjectTable from "./components/project-table";
import WorkspaceModes from "@/components/WorkspaceModes";
import styles from "./development.module.css";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <img src="/empty-state.svg" alt="No projects" className="w-48 h-48 mb-4" />

    <h2 className="text-xl font-semibold text-muted-foreground">No projects found</h2>

    <p className="text-muted-foreground">Create a new project to get started!</p>
  </div>
);

export default function DashboardMainPage() {
  const playgrounds = useQuery(api.playground.action.getPlaygrounds) ?? [];


  return (
    <>
      <NavigationHeader />

      <main className="flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-8 mx-auto">
        <WorkspaceModes active="development" />
        <section className={styles.launch} aria-labelledby="development-title">
          <div className={styles.intro}>
            <h1 id="development-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">Development</h1>
            <p className="mt-3 text-base text-muted-foreground">
              Start with a framework template or open a GitHub repository.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AddNewButton />
            <AddRepo />
          </div>
        </section>

        <div className="mt-10 flex flex-col justify-center items-center w-full">
          {playgrounds.length === 0 ? (
            <EmptyState />
          ) : (
            <ProjectTable projects={playgrounds} />
          )}
        </div>
      </main>
    </>
  );
}
