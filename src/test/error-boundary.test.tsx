import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Boom({ explode }: { explode: boolean }) {
  if (explode) throw new Error("kaboom");
  return <p>All good</p>;
}

describe("ErrorBoundary", () => {
  it("renders the friendly fallback instead of crashing", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom explode />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /return home/i })).toBeInTheDocument();
  });

  it("recovers when the user retries", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    function Harness() {
      return (
        <ErrorBoundary>
          <Boom explode={shouldExplode} />
        </ErrorBoundary>
      );
    }
    let shouldExplode = true;

    const { rerender } = render(<Harness />);
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    shouldExplode = false;
    await user.click(screen.getByRole("button", { name: /try again/i }));
    rerender(<Harness />);

    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("shows a compact fallback in inline mode", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary inline>
        <Boom explode />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
  });
});
