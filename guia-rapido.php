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
								<span class="quick-guide__accordion-icon" aria-hidden="true">💡</span>
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
								<span class="quick-guide__accordion-icon" aria-hidden="true">📍</span>
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
								<span class="quick-guide__accordion-icon" aria-hidden="true">🗺️</span>
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
								<span class="quick-guide__accordion-icon" aria-hidden="true">☀️</span>
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
								<span class="quick-guide__accordion-icon" aria-hidden="true">🎒</span>
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
								<span class="quick-guide__accordion-icon" aria-hidden="true">✨</span>
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
								<span class="quick-guide__accordion-icon" aria-hidden="true">☎️</span>
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
											<span>(27) 12345-6789</span>
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
