import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { LoginScreen } from "./LoginScreen";
import { WelcomeScreen } from "./WelcomeScreen";

describe("authentication screens", () => {
  it("presents the Only Barber proposition", async () => {
    const onStart = jest.fn();
    await render(<WelcomeScreen onStart={onStart} />);
    expect(screen.getByText("Onde todo barbeiro evolui.")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Começar agora" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("validates login fields before submitting", async () => {
    const onLogin = jest.fn();
    await render(<LoginScreen onLogin={onLogin} onDemo={jest.fn()} />);
    await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByText("Informe um e-mail válido.")).toBeOnTheScreen();
    expect(onLogin).not.toHaveBeenCalled();
  });
});
