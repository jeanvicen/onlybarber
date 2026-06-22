import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { CourseDetailScreen } from "./CourseDetailScreen";
import { LearningScreen } from "./LearningScreen";

describe("student course flow", () => {
  it("shows server-owned price and purchase action", async () => {
    const onBuy = jest.fn();
    await render(<CourseDetailScreen onBuy={onBuy} onPreview={jest.fn()} />);
    expect(screen.getByText("R$ 197")).toBeOnTheScreen();
    expect(screen.getByText("O que você vai dominar")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Comprar curso por R$ 197" }));
    expect(onBuy).toHaveBeenCalledTimes(1);
  });

  it("shows the player and saved progress", async () => {
    await render(<LearningScreen />);
    expect(screen.getByText("Aula 8 · Construindo a transição")).toBeOnTheScreen();
    expect(screen.getByText("68% concluído")).toBeOnTheScreen();
    expect(screen.getAllByLabelText(/Abrir aula/).length).toBeGreaterThan(2);
  });
});
