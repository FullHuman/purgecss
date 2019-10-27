export const TEST_1_CONTENT = `
<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            This is the master sidebar.
        @show

        <div class="test-container">
            @yield('content')
        </div>
        @if (count($records) === 1)
          <a href="#" id="a-link" class="a-link"></a>
        @else
          <input id="blo" type="text" disabled/>
        @endif
        <div class="test-footer"></div>
    </body>
</html>
`;

export const TEST_1_TAG = [
  "html",
  "head",
  "title",
  "body",
  "div",
  "a",
  "input"
];

export const TEST_1_CLASS = ["test-container", "test-footer", "a-link"];

export const TEST_1_ID = ["a-link", "blo"];
