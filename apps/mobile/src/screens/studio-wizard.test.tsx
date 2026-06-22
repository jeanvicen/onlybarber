import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { CourseWizardScreen } from "./CourseWizardScreen";

describe("instructor course wizard", () => {
  it("preserves the guided steps and validates before advancing", async () => {
    await render(<CourseWizardScreen onSubmit={jest.fn()} />);
    expect(screen.getByText("1. Informações")).toBeOnTheScreen();
    expect(screen.getByText("2. Conteúdo")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Continuar para conteúdo" }));
    expect(screen.getByText("Informe um título com pelo menos 5 caracteres.")).toBeOnTheScreen();
  });

  it("adds modules without losing the draft", async () => {
    await render(<CourseWizardScreen onSubmit={jest.fn()} />);
    await fireEvent.changeText(screen.getByLabelText("Título do curso"), "Degradê completo");
    await fireEvent.changeText(screen.getByLabelText("Descrição do curso"), "Aprenda um método completo de preparação, marcação, transição e acabamento profissional.");
    await fireEvent.changeText(screen.getByLabelText("Preço do curso"), "197");
    await fireEvent.press(screen.getByRole("button", { name: "Continuar para conteúdo" }));
    expect(screen.getByText("Módulo 1 · Fundamentos")).toBeOnTheScreen();
    expect(screen.getByText("Degradê completo")).toBeOnTheScreen();
  });
});
