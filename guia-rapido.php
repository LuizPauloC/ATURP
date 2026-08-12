<?php
$pageTitle = 'Guia Rápido | ATURP - Pancas, ES';
$customCss = ['./css/directory-cards.css', './css/guia-rapido.css'];
$headerStartsTransparent = true;
include 'includes/header.php';
?>

<section class="quick-guide-hero" aria-labelledby="quick-guide-hero-title">
			<div class="quick-guide-hero__content layout-container">
				<p class="eyebrow eyebrow--on-dark">Chegou em Pancas?</p>
				<h1 id="quick-guide-hero-title" class="quick-guide-hero__title section-title--on-dark">
					Bem-vindo a Pancas!
				</h1>
				<p class="quick-guide-hero__description">
					Encontre agora onde ficar e o que não pode faltar no seu roteiro com acesso rápido pensado para quem
					chegou de parapente. 🪂
				</p>
			</div>
		</section>

		<main class="directory-page quick-guide-page">
			<?php
			$breadcrumbs = [
				['label' => 'Início', 'url' => './index.php'],
				['label' => 'Guia'],
			];
			include 'includes/breadcrumb.php';
			?>
			<section
				id="quick-access"
				class="directory-section quick-guide__section quick-guide__section--soft"
				aria-labelledby="quick-access-title"
			>
				<div class="layout-container">
					<div class="directory-section__intro quick-guide__intro">
						<p class="eyebrow">Acesso rápido</p>
						<h2 id="quick-access-title" class="section-title">Encontre o que precisa aqui</h2>
					</div>

					<div class="quick-guide__shortcut-grid">
						<a
							href="./onde-comer.php"
							class="quick-guide__shortcut"
							aria-label="Abrir a página Onde Comer Agora"
						>
							<span class="quick-guide__shortcut-media" aria-hidden="true">
								<img src="./assets/quick-guide/atalho-onde-comer-agora.png" alt="" loading="lazy" />
							</span>
							<span class="quick-guide__shortcut-panel">
								<span class="quick-guide__shortcut-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
										<path
											d="M63.9 14.4C63.1 6.2 56.2 0 48 0s-15.1 6.2-16 14.3L17.9 149.7c-1.3 6-1.9 12.1-1.9 18.2 0 45.9 35.1 83.6 80 87.7L96 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224.4c44.9-4.1 80-41.8 80-87.7 0-6.1-.6-12.2-1.9-18.2L223.9 14.3C223.1 6.2 216.2 0 208 0s-15.1 6.2-15.9 14.4L178.5 149.9c-.6 5.7-5.4 10.1-11.1 10.1-5.8 0-10.6-4.4-11.2-10.2L143.9 14.6C143.2 6.3 136.3 0 128 0s-15.2 6.3-15.9 14.6L99.8 149.8c-.5 5.8-5.4 10.2-11.2 10.2-5.8 0-10.6-4.4-11.1-10.1L63.9 14.4zM448 0C432 0 320 32 320 176l0 112c0 35.3 28.7 64 64 64l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-448c0-17.7-14.3-32-32-32z"
										/>
									</svg>
								</span>
								<span class="quick-guide__shortcut-copy">
									<strong>Onde Comer Agora</strong>
								</span>
								<span class="quick-guide__shortcut-arrow" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
										<path
											d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
										/>
									</svg>
								</span>
								<span class="quick-guide__shortcut-text"
									>Sabores locais, restaurantes, bares e lanchonetes.</span
								>
							</span>
						</a>

						<a
							href="./onde-ficar.php"
							class="quick-guide__shortcut"
							aria-label="Abrir a página Encontrar Pousada"
						>
							<span class="quick-guide__shortcut-media" aria-hidden="true">
								<img src="./assets/quick-guide/atalho-encontrar-pousada.png" alt="" loading="lazy" />
							</span>
							<span class="quick-guide__shortcut-panel">
								<span class="quick-guide__shortcut-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
										<path
											d="M32 32c17.7 0 32 14.3 32 32l0 224 224 0 0-128c0-17.7 14.3-32 32-32l160 0c53 0 96 43 96 96l0 224c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64-448 0 0 64c0 17.7-14.3 32-32 32S0 465.7 0 448L0 64C0 46.3 14.3 32 32 32zm80 160a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"
										/>
									</svg>
								</span>
								<span class="quick-guide__shortcut-copy">
									<strong>Encontrar Pousada</strong>
								</span>
								<span class="quick-guide__shortcut-arrow" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
										<path
											d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
										/>
									</svg>
								</span>
								<span class="quick-guide__shortcut-text"
									>Pousadas e hospedagens para descansar durante sua visita.</span
								>
							</span>
						</a>

						<button
							type="button"
							class="quick-guide__shortcut"
							data-scroll="#must-see"
							aria-label="Ir para a seção Mapa de Atrações"
						>
							<span class="quick-guide__shortcut-media" aria-hidden="true">
								<img src="./assets/quick-guide/atalho-mapa-atracoes.png" alt="" loading="lazy" />
							</span>
							<span class="quick-guide__shortcut-panel">
								<span class="quick-guide__shortcut-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
										<path
											d="M576 48c0-11.1-5.7-21.4-15.2-27.2s-21.2-6.4-31.1-1.4L413.5 77.5 234.1 17.6c-8.1-2.7-16.8-2.1-24.4 1.7l-128 64C70.8 88.8 64 99.9 64 112l0 352c0 11.1 5.7 21.4 15.2 27.2s21.2 6.4 31.1 1.4l116.1-58.1 173.3 57.8c-4.3-6.4-8.5-13.1-12.6-19.9-11-18.3-21.9-39.3-30-61.8l-101.2-33.7 0-284.5 128 42.7 0 99.3c31-35.8 77-58.4 128-58.4 22.6 0 44.2 4.4 64 12.5L576 48zM512 224c-66.3 0-120 52.8-120 117.9 0 68.9 64.1 150.4 98.6 189.3 11.6 13 31.3 13 42.9 0 34.5-38.9 98.6-120.4 98.6-189.3 0-65.1-53.7-117.9-120-117.9zM472 344a40 40 0 1 1 80 0 40 40 0 1 1 -80 0z"
										/>
									</svg>
								</span>
								<span class="quick-guide__shortcut-copy">
									<strong>Mapa de Atrações</strong>
								</span>
								<span class="quick-guide__shortcut-arrow" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
										<path
											d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
										/>
									</svg>
								</span>
								<span class="quick-guide__shortcut-text"
									>Veja os pontos essenciais e organize seu roteiro em poucos toques.</span
								>
							</span>
						</button>
					</div>
				</div>
			</section>

			<section id="tour-guides" class="directory-section quick-guide__section" aria-labelledby="tour-guides-title">
				<div class="layout-container">
					<div class="directory-section__intro quick-guide__intro">
						<p class="eyebrow">Guias Credenciados</p>
						<h2 id="tour-guides-title" class="section-title">Encontre um Guia de Turismo</h2>
					</div>

					<div class="tour-guides__container">
						<article class="tour-guide-card" aria-label="Claúdio Nass - Guia de Turismo">
							<div class="tour-guide-card__image-container">
								<img
									src="./assets/quick-guide/claudio-nass.png"
									alt="Foto do Guia Claúdio Nass em Pancas"
									class="tour-guide-card__image"
									loading="lazy"
								/>
							</div>
							<div class="tour-guide-card__content">
								<h3 class="tour-guide-card__name">Claúdio Nass</h3>
								<p class="tour-guide-card__role">Guia Regional</p>
								<p class="tour-guide-card__bio">
									<strong>Guia credenciado</strong> especializado em ecoturismo e turismo de aventura em
									Pancas. Conduz visitantes com segurança pelos principais atrativos da região, incluindo a
									famosa <strong>Trilha do Operário</strong>, caminhadas ecológicas e visitas aos
									<strong>Pontões Capixabas</strong>.
								</p>
								<div class="tour-guide-card__contacts">
									<a
										href="https://www.instagram.com/nassclaudio.guia_pancas/"
										target="_blank"
										rel="noopener noreferrer"
										class="guide-contact-btn guide-contact-btn--instagram"
										aria-label="Abrir perfil de Instagram de Claúdio Nass em uma nova aba"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 448 512"
											aria-hidden="true"
											focusable="false"
										>
											<path
												fill="currentColor"
												d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12.2 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
											/>
										</svg>
										<span>Instagram</span>
									</a>
									<a
										href="https://wa.me/5527998369692"
										target="_blank"
										rel="noopener noreferrer"
										class="guide-contact-btn guide-contact-btn--whatsapp"
										aria-label="Iniciar conversa com Claúdio Nass no WhatsApp em uma nova aba"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 448 512"
											aria-hidden="true"
											focusable="false"
										>
											<path
												fill="currentColor"
												d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
											/>
										</svg>
										<span>WhatsApp</span>
									</a>
								</div>
							</div>
						</article>
					</div>
				</div>
			</section>

			<section
				id="survival-guide"
				class="directory-section quick-guide__section quick-guide__section--contrast"
				aria-labelledby="survival-guide-title"
			>
				<div class="layout-container">
					<div class="directory-section__intro quick-guide__intro">
						<p class="eyebrow">Orientações</p>
						<h2 id="survival-guide-title" class="section-title">Orientações para sua visita</h2>
					</div>

					<div class="quick-guide__accordion-group">
						<details class="quick-guide__accordion" open>
							<summary class="quick-guide__accordion-summary">
								<span class="quick-guide__accordion-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
										<path d="M424.5 355.1C449 329.2 464 294.4 464 256C464 176.5 399.5 112 320 112C240.5 112 176 176.5 176 256C176 294.4 191 329.2 215.5 355.1C236.8 377.5 260.4 409.1 268.8 448L371.2 448C379.6 409 403.2 377.5 424.5 355.1zM459.3 388.1C435.7 413 416 443.4 416 477.7L416 496C416 540.2 380.2 576 336 576L304 576C259.8 576 224 540.2 224 496L224 477.7C224 443.4 204.3 413 180.7 388.1C148 353.7 128 307.2 128 256C128 150 214 64 320 64C426 64 512 150 512 256C512 307.2 492 353.7 459.3 388.1zM272 248C272 261.3 261.3 272 248 272C234.7 272 224 261.3 224 248C224 199.4 263.4 160 312 160C325.3 160 336 170.7 336 184C336 197.3 325.3 208 312 208C289.9 208 272 225.9 272 248z"/>
									</svg>
								</span>
								<span>Dicas</span>
							</summary>
							<div class="quick-guide__accordion-content">
								<p class="quick-guide__accordion-text">
									Use este guia como apoio rápido para deixar o passeio mais leve, flexível e bem distribuído
									ao longo do dia.
								</p>
								<ul class="quick-guide__list">
									<li>Planeje o dia com margem para mudanças de clima, trânsito e tempo de descanso.</li>
									<li>Considere o ritmo do passeio, não apenas a distância entre os atrativos.</li>
									<li>Leve água, protetor solar e roupas adequadas para o tipo de experiência.</li>
									<li>Reserve tempo para alimentação, pausas e deslocamentos entre os pontos.</li>
									<li>
										Confirme horários e funcionamento antes de sair, principalmente em dias de maior
										movimento.
									</li>
								</ul>
							</div>
						</details>

						<details class="quick-guide__accordion">
							<summary class="quick-guide__accordion-summary">
								<span class="quick-guide__accordion-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
										<path d="M352 348.4C416.1 333.9 464 276.5 464 208C464 128.5 399.5 64 320 64C240.5 64 176 128.5 176 208C176 276.5 223.9 333.9 288 348.4L288 544C288 561.7 302.3 576 320 576C337.7 576 352 561.7 352 544L352 348.4zM328 160C297.1 160 272 185.1 272 216C272 229.3 261.3 240 248 240C234.7 240 224 229.3 224 216C224 158.6 270.6 112 328 112C341.3 112 352 122.7 352 136C352 149.3 341.3 160 328 160z"/>
									</svg>
								</span>
								<span>Chegada</span>
							</summary>
							<div class="quick-guide__accordion-content">
								<p class="quick-guide__accordion-text">
									Ao chegar em Pancas, vale começar com uma base mínima de organização para deslocamento,
									hospedagem e alimentação. Isso ajuda a evitar correria logo nas primeiras horas da viagem.
								</p>
								<ul class="quick-guide__list">
									<li>
										Confira horário de saída, tempo de estrada e nível de combustível antes de entrar no
										roteiro.
									</li>
									<li>Tenha em mãos o endereço da hospedagem e dos primeiros pontos planejados.</li>
									<li>
										Como o sinal pode oscilar conforme o relevo, baixe mapas e combine pontos de encontro com
										o grupo.
									</li>
									<li>Se possível, já identifique onde fazer uma refeição rápida ou uma pausa ao chegar.</li>
								</ul>
							</div>
						</details>

						<details class="quick-guide__accordion">
							<summary class="quick-guide__accordion-summary">
								<span class="quick-guide__accordion-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
										<path d="M576 112C576 100.9 570.3 90.6 560.8 84.8C551.3 79 539.6 78.4 529.7 83.4L413.5 141.5L234.1 81.6C226 78.9 217.3 79.5 209.7 83.3L81.7 147.3C70.8 152.8 64 163.9 64 176L64 528C64 539.1 69.7 549.4 79.2 555.2C88.7 561 100.4 561.6 110.3 556.6L226.4 498.5L405.8 558.3C413.9 561 422.6 560.4 430.2 556.6L558.2 492.6C569 487.2 575.9 476.1 575.9 464L575.9 112zM256 440.9L256 156.4L384 199.1L384 483.6L256 440.9z"/>
									</svg>
								</span>
								<span>Roteiro</span>
							</summary>
							<div class="quick-guide__accordion-content">
								<p class="quick-guide__accordion-text">
									Um bom roteiro combina atrativos, refeições e pausas sem concentrar tudo no mesmo turno.
									Assim, fica mais fácil aproveitar a experiência com segurança e sem pressa.
								</p>
								<ul class="quick-guide__list">
									<li>Monte o percurso por proximidade para evitar deslocamentos desnecessários.</li>
									<li>Alterne atividades mais intensas com momentos de contemplação ou descanso.</li>
									<li>
										Deixe margem para adaptar o dia conforme o clima, a luz disponível e o ritmo da viagem.
									</li>
									<li>
										Use a seção de imperdíveis como ponto de partida e ajuste o restante do passeio a partir
										dela.
									</li>
								</ul>
							</div>
						</details>

						<details class="quick-guide__accordion">
							<summary class="quick-guide__accordion-summary">
								<span class="quick-guide__accordion-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
										<path d="M208.3 256C251.4 256 288.8 280.4 307.5 316.1C322.2 298.9 343.9 288 368.3 288C412.5 288 448.3 323.8 448.3 368C448.3 373.5 447.7 378.9 446.7 384C447.2 384 447.8 384 448.3 384C501.3 384 544.3 427 544.3 480C544.3 533 501.3 576 448.3 576L128.3 576C75.3 576 32.3 533 32.3 480C32.3 437.5 60 401.5 98.3 388.8C97 382 96.3 375.1 96.3 368C96.3 306.1 146.4 256 208.3 256zM400.3 32.2C405.6 32.2 410.6 34.9 413.6 39.3L460.9 109.7L544.2 93.4C549.4 92.4 554.8 94.1 558.5 97.8C562.3 101.6 563.9 107 562.9 112.2L546.6 195.5L617 242.8C621.4 245.8 624.1 250.8 624.1 256.1C624.1 261.4 621.5 266.4 617.1 269.3L546.7 316.6L561.2 390.8C544 369.1 520.8 352.4 494 343.5C491.5 330.8 487.1 318.9 481.2 307.8C490.8 292.9 496.4 275.1 496.4 256.1C496.4 203.1 453.4 160.1 400.4 160.1C352.5 160.1 312.8 195.2 305.6 241C284.7 225 259.7 214 232.5 209.9L254 195.4L237.7 112.2L237.4 110.2C237.1 105.6 238.7 101.1 242 97.8C245.8 94 251.2 92.4 256.4 93.4L339.7 109.7L387 39.3L388.2 37.7C391.2 34.2 395.6 32.2 400.3 32.2zM400.3 208C426.8 208 448.3 229.5 448.3 256C448.3 259.8 447.8 263.6 446.9 267.1C425.2 250.2 398 240 368.3 240C363.7 240 359.2 240.2 354.8 240.7C361.2 221.7 379.1 208 400.3 208z"/>
									</svg>
								</span>
								<span>Clima</span>
							</summary>
							<div class="quick-guide__accordion-content">
								<p class="quick-guide__accordion-text">
									Em Pancas, clima, luminosidade e terreno fazem diferença principalmente em trilhas, mirantes,
									cachoeiras e experiências ao ar livre. Ajustar o plano do dia melhora conforto e segurança.
								</p>
								<ul class="quick-guide__list">
									<li>
										Observe a previsão antes de sair, especialmente se o roteiro incluir natureza ou altitude.
									</li>
									<li>
										Prefira roupas leves, calçado confortável e uma camada extra para variações ao longo do
										dia.
									</li>
									<li>Leve proteção solar e água, principalmente nos horários mais quentes.</li>
									<li>Se o tempo virar, reorganize o percurso em vez de insistir em trechos menos seguros.</li>
								</ul>
							</div>
						</details>

						<details class="quick-guide__accordion">
							<summary class="quick-guide__accordion-summary">
								<span class="quick-guide__accordion-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
										<path d="M272 88C272 83.6 275.6 80 280 80L360 80C364.4 80 368 83.6 368 88L368 160L272 160L272 88zM448 160L416 160L416 88C416 57.1 390.9 32 360 32L280 32C249.1 32 224 57.1 224 88L224 160L192 160C156.7 160 128 188.7 128 224L128 512C128 547.3 156.7 576 192 576C192 593.7 206.3 608 224 608C241.7 608 256 593.7 256 576L384 576C384 593.7 398.3 608 416 608C433.7 608 448 593.7 448 576C483.3 576 512 547.3 512 512L512 224C512 188.7 483.3 160 448 160zM248 272L392 272C405.3 272 416 282.7 416 296C416 309.3 405.3 320 392 320L248 320C234.7 320 224 309.3 224 296C224 282.7 234.7 272 248 272zM248 400L392 400C405.3 400 416 410.7 416 424C416 437.3 405.3 448 392 448L248 448C234.7 448 224 437.3 224 424C224 410.7 234.7 400 248 400z"/>
									</svg>
								</span>
								<span>Antes da viagem</span>
							</summary>
							<div class="quick-guide__accordion-content">
								<p class="quick-guide__accordion-text">
									Uma preparação simples ajuda a viagem a começar com menos imprevistos e mais autonomia.
								</p>
								<ul class="quick-guide__list">
									<li>Confira a previsão do tempo para os dias do passeio.</li>
									<li>Confirme horários, disponibilidade e funcionamento dos locais que pretende visitar.</li>
									<li>Separe roupas e calçados adequados para caminhada, deslocamento e clima aberto.</li>
									<li>Organize água, proteção solar e itens pessoais essenciais antes de sair.</li>
									<li>Monte o roteiro por proximidade para reduzir idas e voltas desnecessárias.</li>
								</ul>
							</div>
						</details>

						<details class="quick-guide__accordion">
							<summary class="quick-guide__accordion-summary">
								<span class="quick-guide__accordion-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
										<path d="M328.3 88C328.3 57.1 353.4 32 384.3 32C415.2 32 440.3 57.1 440.3 88C440.3 118.9 415.2 144 384.3 144C353.4 144 328.3 118.9 328.3 88zM320.3 269.3L297.7 291.9C291.7 297.9 288.3 306 288.3 314.5L288.3 352C288.3 364.3 281.3 375 271.1 380.4C270.2 384.6 268.7 388.8 266.8 392.7L197.8 530.8L197 530.4L169.3 585.7C159.4 605.5 135.4 613.5 115.6 603.6L78.6 585C58.8 575.1 50.8 551.1 60.7 531.3L111.3 430.3C121.2 410.5 145.2 402.5 165 412.4L195.7 427.7L224 371.1C224.3 370.5 224.4 369.9 224.4 369.3L224.4 352.4C224.4 352.2 224.4 352.1 224.4 351.9L224.4 314.4C224.4 288.9 234.5 264.5 252.5 246.5L287.6 211.4C310.4 188.6 341.2 175.8 373.4 175.8C410.3 175.8 445.2 192.6 468.2 221.4L486.1 244C492.2 251.6 501.4 256 511.1 256L544.3 256C562 256 576.3 270.3 576.3 288C576.3 305.7 562 320 544.3 320L511.1 320C481.9 320 454.4 306.7 436.1 284L432.3 279.3L432.3 394.5L466.8 424.1C484.5 439.3 496.1 460.3 499.4 483.4L512 571.5C514.5 589 502.3 605.2 484.8 607.7C467.3 610.2 451.1 598 448.6 580.5L436 492.4C434.9 484.7 431 477.7 425.1 472.6L353.7 411.4C332.4 393.2 320.2 366.5 320.2 338.5L320.2 269.2zM320.4 435.1C322.8 437.4 325.2 439.7 327.8 441.9L373.8 481.3L371.6 488.9C367.1 504.6 358.7 518.9 347.2 530.4L278.9 598.7C266.4 611.2 246.1 611.2 233.6 598.7C221.1 586.2 221.1 565.9 233.6 553.4L302 485.1C305.8 481.3 308.6 476.5 310.1 471.3L320.4 435z"/>
									</svg>
								</span>
								<span>Depois da viagem</span>
							</summary>
							<div class="quick-guide__accordion-content">
								<p class="quick-guide__accordion-text">
									Depois do retorno, a experiência em Pancas ainda pode continuar. Compartilhar o que funcionou
									bem e manter contato com o destino ajuda a fortalecer o turismo local.
								</p>
								<ul class="quick-guide__list">
									<li>
										Compartilhe registros e recomendações com quem também está planejando visitar Pancas.
									</li>
									<li>Valorize os serviços locais que fizeram parte da sua viagem.</li>
									<li>Acompanhe os canais da ATURP para descobrir novos roteiros e futuras atualizações.</li>
								</ul>
							</div>
						</details>

						<details class="quick-guide__accordion">
							<summary class="quick-guide__accordion-summary">
								<span class="quick-guide__accordion-icon" aria-hidden="true">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
										<path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z"/>
									</svg>
								</span>
								<span>Contato da ATURP</span>
							</summary>
							<div class="quick-guide__accordion-content">
								<p class="quick-guide__accordion-text">
									Este bloco reúne o apoio prático já disponível no site e deixa explícito o estado atual do
									contato institucional da associação.
								</p>
								<div class="quick-guide__contact-panel">
									<p class="quick-guide__contact-label">Apoio ao visitante</p>
									<h3 class="quick-guide__contact-title">Contato da ATURP em atualização</h3>
									<p class="quick-guide__contact-note">
										Enquanto os canais institucionais oficiais são atualizados, use o contato de turismo
										abaixo para orientações práticas sobre a visita.
									</p>
									<a
										href="tel:+5527123456789"
										class="quick-guide__contact-link"
										aria-label="Ligar para o contato de turismo no número 27 12345-6789"
									>
										<span class="quick-guide__contact-link-copy">
											<strong>Turismo</strong>
											<span>(00) 00000-0000</span>
										</span>
										<span class="quick-guide__contact-link-arrow" aria-hidden="true">Ligar</span>
									</a>
								</div>
								<div class="quick-guide__contact-utility">
									<p class="quick-guide__contact-note">
										Em caso de urgência, use os atalhos abaixo para ligar rapidamente.
									</p>
									<div class="quick-guide__emergency-list">
										<a
											href="tel:192"
											class="quick-guide__emergency-link"
											aria-label="Ligar para o SAMU no número 192"
										>
											<strong>SAMU</strong>
											<span>192</span>
										</a>
										<a
											href="tel:190"
											class="quick-guide__emergency-link"
											aria-label="Ligar para a Polícia no número 190"
										>
											<strong>Polícia</strong>
											<span>190</span>
										</a>
										<a
											href="tel:193"
											class="quick-guide__emergency-link"
											aria-label="Ligar para os Bombeiros no número 193"
										>
											<strong>Bombeiros</strong>
											<span>193</span>
										</a>
									</div>
								</div>
							</div>
						</details>
					</div>
				</div>
			</section>
		</main>

<?php
$customJs = ['./js/guia-rapido.js'];
include 'includes/footer.php';
?>
