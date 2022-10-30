import { Component, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import { TFunction, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { storePortalWindow, removePortalWindow } from '../redux/actions';
import { portalWindowSelector } from '../redux/selectors';

interface PreviewPortalProps {
  children: ReactElement | null;
  togglePane: (pane: string) => void;
  windowTitle: string;
  t: TFunction;
  portalWindow: Window | null;
  storePortalWindow: (window: Window | null) => void;
  removePortalWindow: () => void;
}

const mapDispatchToProps = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  storePortalWindow,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  removePortalWindow
};
const mapStateToProps = createSelector(
  portalWindowSelector,
  (portalWindow: Window | null) => ({ portalWindow })
);

class PreviewPortal extends Component<PreviewPortalProps> {
  static displayName = 'PreviewPortal';
  mainWindow: Window;
  containerEl;
  titleEl;
  styleEl;

  constructor(props: PreviewPortalProps) {
    super(props);

    this.mainWindow = window;
    this.containerEl = document.createElement('div');
    this.titleEl = document.createElement('title');
    this.styleEl = document.createElement('style');
  }

  componentDidMount() {
    const { t, windowTitle } = this.props;
    let { portalWindow } = this.props;

    this.titleEl.innerText = `${t(
      'learn.editor-tabs.preview'
    )} | ${windowTitle}`;

    this.styleEl.innerHTML = `
      #fcc-main-frame {
        width: 100%;
        height: 100%;
        border: none;
      }
    `;

    if (portalWindow) {
      (portalWindow.document.firstElementChild as HTMLHtmlElement).innerHTML =
        '';
    } else {
      portalWindow = window.open(
        '',
        '',
        'width=960,height=540,left=100,top=100'
      );
      this.props.storePortalWindow(portalWindow);
    }

    portalWindow?.document.head.appendChild(this.titleEl);
    portalWindow?.document.head.appendChild(this.styleEl);
    portalWindow?.document.body.setAttribute(
      'style',
      `
        margin: 0px;
        padding: 0px;
        overflow: hidden;
      `
    );
    portalWindow?.document.body.appendChild(this.containerEl);
    portalWindow?.addEventListener('beforeunload', () => {
      this.props.togglePane('showPreviewPortal');
      this.props.storePortalWindow(null);
    });

    this.mainWindow?.addEventListener('beforeunload', () => {
      portalWindow?.close();
    });
  }

  /*componentWillUnmount() {
    this.externalWindow?.close();
    this.props.removePortalDocument();
  }*/

  render() {
    return ReactDOM.createPortal(this.props.children, this.containerEl);
  }
}

PreviewPortal.displayName = 'PreviewPortal';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(PreviewPortal));
