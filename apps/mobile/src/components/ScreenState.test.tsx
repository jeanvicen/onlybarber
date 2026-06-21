import { fireEvent, render, screen } from "@testing-library/react-native";
import { describe, expect, it, jest } from "@jest/globals";
import { ScreenState } from "./ScreenState";

describe("ScreenState", () => {
  it("shows a useful empty state and action", async () => {
    const onAction = jest.fn();
    await render(
      <ScreenState
        state="empty"
        title="Nenhum curso encontrado"
        description="Tente remover alguns filtros."
        actionLabel="Limpar filtros"
        onAction={onAction}
      />,
    );
    expect(screen.getByText("Nenhum curso encontrado")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("shows loading without a blank screen", async () => {
    await render(<ScreenState state="loading" title="Carregando cursos" />);
    expect(screen.getByText("Carregando cursos")).toBeOnTheScreen();
  });
});
