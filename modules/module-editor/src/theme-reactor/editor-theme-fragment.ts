import { ThemeFragment } from '@journeyapps/reactor-mod';
import { Themes } from '@journeyapps/reactor-mod';

export const theme = new ThemeFragment({
  structure: {
    editor: {
      label: 'Code editor',
      colors: {
        backgroundSticky: 'Sticky editor layer background color'
      }
    }
  }
});

theme.addThemeValues({
  name: Themes.REACTOR,
  values: {
    editor: {
      backgroundSticky: '#1b212b'
    }
  }
});
theme.addThemeValues({
  name: Themes.REACTOR_DARK,
  values: {
    editor: {
      backgroundSticky: '#0f0f0f'
    }
  }
});
theme.addThemeValues({
  name: Themes.HEXAGON,
  values: {
    editor: {
      backgroundSticky: 'rgb(22,22,23)'
    }
  }
});
theme.addThemeValues({
  name: Themes.JOURNEY,
  values: {
    editor: {
      backgroundSticky: 'rgb(38, 50, 56)'
    }
  }
});
theme.addThemeValues({
  name: Themes.REACTOR_LIGHT,
  values: {
    editor: {
      backgroundSticky: '#cccccc'
    }
  }
});
export const Scarlet = theme.addThemeValues({
  name: Themes.SCARLET,
  values: {
    editor: {
      backgroundSticky: '#1d222a'
    }
  }
});
theme.addThemeValues({
  name: Themes.OXIDE,
  values: {
    editor: {
      backgroundSticky: 'rgb(32,32,33)'
    }
  }
});
theme.addThemeValues({
  name: Themes.BUNNY,
  values: {
    editor: {
      backgroundSticky: '#161322'
    }
  }
});

export const styled = theme.styled();
export const themed = theme.styled();
