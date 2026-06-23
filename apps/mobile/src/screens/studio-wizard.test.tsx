import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { CourseWizardScreen } from "./CourseWizardScreen";

describe("instructor course wizard", () => {
  it("preserves the guided steps and validates before advancing", async () => {
    await render(<CourseWizardScreen onSubmit={jest.fn((_draft: unknown) => undefined)} />);
    expect(screen.getByText("1. Informações")).toBeOnTheScreen();
    expect(screen.getByText("2. Conteúdo")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Continuar para conteúdo" }));
    expect(screen.getByText("Informe um título com pelo menos 5 caracteres.")).toBeOnTheScreen();
  });

  it("adds modules without losing the draft", async () => {
    await render(<CourseWizardScreen onSubmit={jest.fn((_draft: unknown) => undefined)} />);
    await fireEvent.changeText(screen.getByLabelText("Título do curso"), "Degradê completo");
    await fireEvent.changeText(screen.getByLabelText("Descrição do curso"), "Aprenda um método completo de preparação, marcação, transição e acabamento profissional.");
    await fireEvent.changeText(screen.getByLabelText("Preço do curso"), "197");
    await fireEvent.press(screen.getByRole("button", { name: "Continuar para conteúdo" }));
    expect(screen.getByText("Módulo 1 · Fundamentos")).toBeOnTheScreen();
    expect(screen.getByText("Degradê completo")).toBeOnTheScreen();
  });

  it("shows progress while the course is being saved", async () => {
    let finish!: () => void;
    const onSubmit = jest.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    await render(<CourseWizardScreen onSubmit={onSubmit} />);
    await fireEvent.changeText(screen.getByLabelText("Título do curso"), "Degradê completo");
    await fireEvent.changeText(screen.getByLabelText("Descrição do curso"), "Aprenda um método completo de preparação, marcação, transição e acabamento profissional.");
    await fireEvent.changeText(screen.getByLabelText("Preço do curso"), "197");
    await fireEvent.press(screen.getByRole("button", { name: "Continuar para conteúdo" }));
    await fireEvent.press(screen.getByRole("button", { name: "Revisar curso" }));
    const pressing = fireEvent.press(screen.getByRole("button", { name: "Enviar curso para revisão" }));
    await waitFor(() => expect(screen.getByText("SALVANDO...")).toBeOnTheScreen());
    await act(async () => {
      finish();
      await pressing;
    });
  });
});
