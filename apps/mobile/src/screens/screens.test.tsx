import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { HomeScreen } from "./HomeScreen";
import { StudioScreen } from "./StudioScreen";

describe("Only Barber screens", () => {
  it("renders the discovery experience", async () => {
    await render(<HomeScreen />);
    expect(screen.getByText("Evolua sua técnica.")).toBeOnTheScreen();
    expect(screen.getByText("Cursos em destaque")).toBeOnTheScreen();
    expect(screen.getAllByLabelText(/Abrir curso/).length).toBeGreaterThan(1);
  });

  it("renders the instructor Studio metrics and course action", async () => {
    await render(<StudioScreen additionalCourses={[{
      id: "demo_1",
      name: "Curso criado nesta build",
      status: "EM REVISÃO",
      detail: "1 módulo · 3 aulas",
      revenue: "—",
    }]} />);
    expect(screen.getByText("Studio do instrutor")).toBeOnTheScreen();
    expect(screen.getByText("R$ 12.480")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Criar novo curso" })).toBeOnTheScreen();
    expect(screen.getByText("Curso criado nesta build")).toBeOnTheScreen();
  });
});
