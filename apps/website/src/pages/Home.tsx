const Card = () => {
  return (
    <div class="card flex sm:flex-row gap-4 size-fit p-8">
      <img
        src="https://cdn.flyonui.com/fy-assets/icons/solidjs-icon.png"
        alt="Solidjs logo"
        class="size-40"
      />
      <div class="max-w-2xl">
        <h2 class="text-3xl font-semibold text-info mb-3">You did it! 🎉</h2>
        <p>
          You’ve successfully created a project with{" "}
          <a
            class="link link-animated text-info font-semibold"
            href="https://flyonui.com/"
          >
            FlyonUI
          </a>
          +
          <a
            class="link link-animated text-info font-semibold"
            href="https://www.solidjs.com/"
          >
            SolidJS
          </a>
          .
        </p>
        <p class="text-base text-base-content">
          Explore our pre-built components by navigating the menu. Test them
          with various themes from the navbar, and feel free to copy and paste
          any component to see it in action!
        </p>
        <p class="mt-2">
          This example includes reusable Button and Accordion components. You
          can leverage these to build any custom component using FlyonUI,
          tailored to your specific requirements.
        </p>
      </div>
    </div>
  );
};

export default Card;
